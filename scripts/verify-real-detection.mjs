/**
 * Step 7.2B.1 — real check lifecycle tests with an injected test-only service.
 * Never used by the production Detect AI button.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "integrito-real-"));
const results = [];
const pass = (id, d = "") => {
  results.push({ id, ok: true, d });
  console.log("PASS", id, d);
};
const fail = (id, d = "") => {
  results.push({ id, ok: false, d });
  console.log("FAIL", id, d);
};

function transpile(rel, rewriteImports = {}) {
  let src = fs.readFileSync(path.join(root, rel), "utf8");
  for (const [from, to] of Object.entries(rewriteImports)) {
    src = src.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const out = path.join(tmp, path.basename(rel).replace(/\.tsx?$/, ".mjs"));
  fs.writeFileSync(out, outputText);
  return out;
}

/* Bundle dependency graph into tmp as ESM */
const detResult = transpile("src/detection/detectionResult.ts");
const realState = transpile("src/detection/realCheckState.ts", {
  '"./detectionResult"': JSON.stringify(pathToFileURL(detResult).href),
});
const textMetrics = transpile("src/utils/textMetrics.ts");
const sessionFile = transpile("src/detection/createRealCheckSession.ts", {
  '"../utils/textMetrics"': JSON.stringify(pathToFileURL(textMetrics).href),
  '"./detectionService"': JSON.stringify(
    pathToFileURL(transpile("src/detection/detectionService.ts", {
      '"./detectionResult"': JSON.stringify(pathToFileURL(detResult).href),
    })).href,
  ),
  '"./realCheckState"': JSON.stringify(pathToFileURL(realState).href),
});

const { createRealCheckSession } = await import(pathToFileURL(sessionFile).href);
const {
  INITIAL_REAL_CHECK_STATE,
  realCheckReducer,
  freezeDetectionResult,
} = await import(pathToFileURL(realState).href);

const fixtureResult = freezeDetectionResult({
  text: "alpha beta gamma",
  score: 42.5,
  classification: "Test classification",
  highlights: [{ start: 0, end: 5, category: "highly-likely" }],
  legend: [{ category: "highly-likely", label: "Highly likely" }],
});

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function makeDeferredService({ delay = 30, fail = false, result = fixtureResult } = {}) {
  const calls = [];
  return {
    calls,
    service: {
      async analyze(text, { signal }) {
        calls.push({ text, signal });
        await new Promise((resolve, reject) => {
          const t = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            if (fail) reject(new Error("backend boom raw secret"));
            else resolve();
          }, delay);
          const onAbort = () => {
            clearTimeout(t);
            const err = new Error("Aborted");
            err.name = "AbortError";
            reject(err);
          };
          if (signal.aborted) onAbort();
          else signal.addEventListener("abort", onAbort, { once: true });
        });
        return {
          text,
          score: result.score,
          classification: result.classification,
          highlights: result.highlights.map((h) => ({ ...h })),
          legend: result.legend.map((l) => ({ ...l })),
        };
      },
    },
  };
}

try {
  // A
  {
    const s = createRealCheckSession({ service: makeDeferredService().service });
    if (s.getState().phase === "idle" && s.getState().submittedText === null) {
      pass("A", "initial idle");
    } else fail("A", JSON.stringify(s.getState()));
    s.dispose();
  }

  // B
  {
    const { service } = makeDeferredService({ delay: 80 });
    const s = createRealCheckSession({ service });
    const p = s.start("hello world sample");
    await wait(5);
    if (s.getState().phase === "processing") pass("B", "processing");
    else fail("B", s.getState().phase);
    s.cancel();
    await p;
    s.dispose();
  }

  // C
  {
    const { service } = makeDeferredService({ delay: 20 });
    const s = createRealCheckSession({ service });
    const draft = "successful check text";
    await s.start(draft);
    const st = s.getState();
    if (st.phase === "result" && st.result?.score === 42.5) pass("C", "result");
    else fail("C", JSON.stringify(st));
    s.dispose();
  }

  // D
  {
    const { service } = makeDeferredService({ delay: 20, fail: true });
    const s = createRealCheckSession({ service });
    await s.start("will fail");
    const st = s.getState();
    if (
      st.phase === "error" &&
      st.error?.code === "request_failed" &&
      !String(st.error.message).includes("secret")
    ) {
      pass("D", JSON.stringify(st.error));
    } else fail("D", JSON.stringify(st));
    s.dispose();
  }

  // E
  {
    const { service } = makeDeferredService({ delay: 100 });
    const s = createRealCheckSession({ service });
    const p = s.start("cancel me");
    await wait(5);
    s.cancel();
    await p;
    if (s.getState().phase === "idle") pass("E", "cancel → idle");
    else fail("E", s.getState().phase);
    s.dispose();
  }

  // F
  {
    let resolveAnalyze;
    const service = {
      analyze: (_text, { signal }) =>
        new Promise((resolve, reject) => {
          resolveAnalyze = resolve;
          signal.addEventListener(
            "abort",
            () => {
              const err = new Error("Aborted");
              err.name = "AbortError";
              reject(err);
            },
            { once: true },
          );
        }),
    };
    const s = createRealCheckSession({ service });
    const p = s.start("stale after abort");
    await wait(5);
    s.cancel();
    resolveAnalyze?.(fixtureResult);
    await p;
    await wait(10);
    if (s.getState().phase === "idle" && s.getState().result == null) {
      pass("F", "aborted cannot produce result");
    } else fail("F", JSON.stringify(s.getState()));
    s.dispose();
  }

  // G
  {
    const { service, calls } = makeDeferredService({ delay: 50 });
    const s = createRealCheckSession({ service });
    const p1 = s.start("first");
    await wait(5);
    const p2 = s.start("second duplicate");
    await Promise.all([p1, p2]);
    if (calls.length === 1 && s.getState().submittedText === "first") {
      pass("G", "duplicate ignored");
    } else fail("G", JSON.stringify({ calls: calls.length, st: s.getState() }));
    s.dispose();
  }

  // H stale overwrite — simulate by dispatching SUCCESS with old id via reducer
  {
    let mid = realCheckReducer(INITIAL_REAL_CHECK_STATE, {
      type: "START",
      text: "one",
      requestId: 1,
    });
    mid = realCheckReducer(mid, {
      type: "START",
      text: "two",
      requestId: 2,
    });
    /* START ignored while processing — stay requestId 1 */
    assert.equal(mid.requestId, 1);
    /* Stale success with wrong id ignored */
    const stale = realCheckReducer(mid, {
      type: "SUCCESS",
      requestId: 99,
      result: fixtureResult,
    });
    assert.equal(stale.phase, "processing");
    const ok = realCheckReducer(mid, {
      type: "SUCCESS",
      requestId: 1,
      result: fixtureResult,
    });
    assert.equal(ok.phase, "result");
    pass("H", "stale requestId ignored");
  }

  // I retry after error
  {
    let failOnce = true;
    const service = {
      async analyze(text, { signal }) {
        await wait(15);
        if (signal.aborted) {
          const err = new Error("Aborted");
          err.name = "AbortError";
          throw err;
        }
        if (failOnce) {
          failOnce = false;
          throw new Error("temp");
        }
        return { ...fixtureResult, text };
      },
    };
    const s = createRealCheckSession({ service });
    await s.start("retry text");
    assert.equal(s.getState().phase, "error");
    await s.start("retry text");
    if (s.getState().phase === "result") pass("I", "retry ok");
    else fail("I", s.getState().phase);
    s.dispose();
  }

  // J reset
  {
    const { service } = makeDeferredService({ delay: 10 });
    const s = createRealCheckSession({ service });
    await s.start("to reset");
    assert.equal(s.getState().phase, "result");
    s.reset();
    if (
      s.getState().phase === "idle" &&
      s.getState().result == null &&
      s.getState().submittedText == null
    ) {
      pass("J", "reset cleared");
    } else fail("J", JSON.stringify(s.getState()));
    s.dispose();
  }

  // K/L userDraft unchanged — session never touches an external draft bag
  {
    let userDraft = "my editable draft stays";
    const snapshot = userDraft;
    const { service } = makeDeferredService({ delay: 10, fail: false });
    const s = createRealCheckSession({ service });
    await s.start(userDraft);
    assert.equal(userDraft, snapshot);
    pass("K", "draft unchanged on success");

    userDraft = "draft on error path";
    const snap2 = userDraft;
    const failing = makeDeferredService({ delay: 10, fail: true });
    const s2 = createRealCheckSession({ service: failing.service });
    await s2.start(userDraft);
    assert.equal(userDraft, snap2);
    pass("L", "draft unchanged on error");
    s.dispose();
    s2.dispose();
  }

  // M submittedText snapshot
  {
    const { service } = makeDeferredService({ delay: 10 });
    const s = createRealCheckSession({ service });
    const submitted = "exact snapshot text 123";
    await s.start(submitted);
    if (s.getState().submittedText === submitted) pass("M", submitted);
    else fail("M", s.getState().submittedText);
    s.dispose();
  }

  // N demo fixture never in userDraft — session only stores submittedText from args
  {
    const sample = fs.readFileSync(
      path.join(root, "src/data/sampleDocument.ts"),
      "utf8",
    );
    const sessionSrc = fs.readFileSync(
      path.join(root, "src/detection/createRealCheckSession.ts"),
      "utf8",
    );
    assert.doesNotMatch(sessionSrc, /SAMPLE_DETECTION|SAMPLE_DOCUMENT/);
    assert.match(sample, /isDemo:\s*true/);
    pass("N", "no fixture import in session");
  }

  // O result frozen
  {
    const { service } = makeDeferredService({ delay: 10 });
    const s = createRealCheckSession({ service });
    await s.start("freeze me");
    const result = s.getState().result;
    assert.ok(result);
    assert.throws(() => {
      result.score = 0;
    });
    pass("O", "result frozen");
    s.dispose();
  }

  // P no activeStep dependency
  {
    const src = fs.readFileSync(
      path.join(root, "src/detection/createRealCheckSession.ts"),
      "utf8",
    );
    const ctx = fs.readFileSync(
      path.join(root, "src/detection/RealDetectionContext.tsx"),
      "utf8",
    );
    assert.doesNotMatch(src, /from ["'].*demoExperience|IntersectionObserver|useDemoExperience/);
    assert.doesNotMatch(ctx, /useDemoExperience|activeStep/);
    pass("P", "no editorial/demo coupling");
  }

  // Q compact/expanded — provider does not key off composerExpanded
  {
    const ctx = fs.readFileSync(
      path.join(root, "src/detection/RealDetectionContext.tsx"),
      "utf8",
    );
    const stage = fs.readFileSync(
      path.join(root, "src/sections/StorytellingStage.tsx"),
      "utf8",
    );
    assert.doesNotMatch(ctx, /composerExpanded/);
    assert.match(stage, /RealDetectionProvider/);
    pass("Q", "provider above composer; no expand reset");
  }
} catch (e) {
  fail("RUN", String(e.stack || e));
}

// R / S
try {
  execSync("npx tsc -b --pretty false", { cwd: root, stdio: "pipe" });
  pass("R", "tsc ok");
} catch (e) {
  fail("R", e.stderr?.toString?.() || e.message);
}
try {
  const out = execSync("npm run build", { cwd: root, encoding: "utf8" });
  pass("S", out.trim().split("\n").slice(-2).join(" | "));
} catch (e) {
  fail("S", e.message);
}

console.log("\n=== SUMMARY ===");
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.id}: ${r.d}`);
const failed = results.filter((r) => !r.ok);
fs.writeFileSync(
  path.join(root, "artifacts/step-07-2b-1/report.json"),
  JSON.stringify(results, null, 2),
);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failed.length ? 1 : 0);
