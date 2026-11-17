/**
 * Focused checks for data-driven detection result helpers.
 * Uses local fixtures only — not production user detection.
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "integrito-det-"));

function loadTs(rel) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const file = path.join(tmp, path.basename(rel).replace(/\.ts$/, ".mjs"));
  fs.writeFileSync(file, outputText);
  return import(pathToFileURL(file).href);
}

const {
  clampDetectionScore,
  formatRevealScore,
  revealScoreValue,
  HIGHLY_LIKELY_LEGEND,
} = await loadTs("src/detection/detectionResult.ts");

assert.equal(clampDetectionScore(81.59), 81.59);
assert.equal(clampDetectionScore(-5), 0);
assert.equal(clampDetectionScore(140), 100);
assert.equal(formatRevealScore(81.59, 1), "81.59");
assert.equal(formatRevealScore(81.59, 0), "0.00");
assert.equal(formatRevealScore(0, 1), "0.00");
assert.equal(formatRevealScore(100, 1), "100.00");
assert.equal(formatRevealScore(50, 0.5), "25.00");
assert.equal(revealScoreValue(81.59, 1), 81.59);
assert.equal(revealScoreValue(100, 0.25), 25);
assert.equal(HIGHLY_LIKELY_LEGEND.label, "Highly likely");

const highlightSrc = `
export function mergeRanges(ranges) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const next = sorted[i];
    if (next.start <= prev.end) prev.end = Math.max(prev.end, next.end);
    else merged.push({ ...next });
  }
  return merged;
}
export function buildHighlightSegments(text, highlights) {
  if (!text) return [];
  const local = mergeRanges(highlights.filter((h) => h.end > h.start && h.start < text.length));
  if (local.length === 0) return [{ text, highlighted: false, highlightIndex: -1 }];
  const segments = [];
  let cursor = 0;
  let highlightIndex = 0;
  for (const h of local) {
    const start = Math.max(0, h.start);
    const end = Math.min(text.length, h.end);
    if (start > cursor) segments.push({ text: text.slice(cursor, start), highlighted: false, highlightIndex: -1 });
    if (end > start) segments.push({ text: text.slice(start, end), highlighted: true, highlightIndex: highlightIndex++ });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlighted: false, highlightIndex: -1 });
  return segments;
}
export function highlightRevealAmount(index, count, progress) {
  if (count <= 0) return 0;
  if (progress >= 1) return 1;
  if (progress <= 0) return 0;
  const start = index / count;
  const end = (index + 1) / count;
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}
`;
const hlFile = path.join(tmp, "hl.mjs");
fs.writeFileSync(hlFile, highlightSrc);
const { buildHighlightSegments, highlightRevealAmount } = await import(
  pathToFileURL(hlFile).href
);

const text = "AAAA BBBB CCCC";
const segs = buildHighlightSegments(text, [
  { start: 5, end: 9, category: "highly-likely" },
]);
assert.equal(segs.length, 3);
assert.equal(segs[1].text, "BBBB");
assert.equal(segs[1].highlighted, true);
assert.equal(highlightRevealAmount(0, 2, 0.5), 1);
assert.equal(highlightRevealAmount(1, 2, 0.5), 0);

const sample = fs.readFileSync(
  path.join(root, "src/data/sampleDocument.ts"),
  "utf8",
);
assert.match(sample, /score:\s*SAMPLE_DETECTION_SCORE/);
assert.match(sample, /81\.59/);
assert.match(sample, /isDemo:\s*true/);
assert.doesNotMatch(
  fs.readFileSync(path.join(root, "src/components/DetectorResultView.tsx"), "utf8"),
  /SAMPLE_DETECTION|81\.59|sampleDocument/,
);

console.log("verify-detection-result: ALL PASSED");
fs.rmSync(tmp, { recursive: true, force: true });
