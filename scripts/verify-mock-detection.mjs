/**
 * Unit checks for MockDetectionService (deterministic, abort, ranges).
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "integrito-mock-"));

function compile(rel) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const out = path.join(tmp, path.basename(rel).replace(/\.ts$/, ".mjs"));
  fs.writeFileSync(out, outputText);
  return out;
}

const detFile = compile("src/detection/detectionResult.ts");
compile("src/detection/detectionService.ts");
let mockSrc = fs.readFileSync(
  path.join(root, "src/detection/mockDetectionService.ts"),
  "utf8",
);
mockSrc = mockSrc
  .replace(
    'from "./detectionResult"',
    `from ${JSON.stringify(pathToFileURL(detFile).href)}`,
  )
  .replace('from "./detectionService"', 'from "./detectionService.mjs"');
const mockFile = path.join(tmp, "mockDetectionService.mjs");
fs.writeFileSync(
  mockFile,
  ts.transpileModule(mockSrc, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
);

const mock = await import(pathToFileURL(mockFile).href);

const text =
  "First sentence here. Second sentence is longer and clearer.\n\nThird paragraph follows with more words.";
const a = mock.generateMockDetectionResult(text);
const b = mock.generateMockDetectionResult(text);
assert.deepEqual(a, b);
assert.equal(a.text, text);
assert.ok(a.score >= 0 && a.score <= 100);
for (const h of a.highlights) {
  assert.ok(h.start >= 0 && h.end <= text.length && h.end > h.start);
}
const other = mock.generateMockDetectionResult(`${text} x`);
assert.notEqual(JSON.stringify(a), JSON.stringify(other));

const svc = mock.createMockDetectionService({ delayMs: 40 });
const ac = new AbortController();
const p = svc.analyze("abort me please now!!", { signal: ac.signal });
ac.abort();
await assert.rejects(p, (err) => err && err.name === "AbortError");

const ok = await svc.analyze(text, { signal: new AbortController().signal });
assert.equal(ok.text, text);

console.log("verify-mock-detection: ALL PASSED");
fs.rmSync(tmp, { recursive: true, force: true });
