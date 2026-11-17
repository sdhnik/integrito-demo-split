/**
 * Deterministic MockDetectionService for UI testing.
 * No network, no model, no demo fixture substitution.
 */

import {
  HIGHLY_LIKELY_LEGEND,
  clampDetectionScore,
  type DetectionHighlightRange,
  type DetectionResultData,
} from "./detectionResult";
import type { DetectionService } from "./detectionService";

export const MOCK_DETECTION_DELAY_MS = 1500;

export type MockDetectionServiceOptions = {
  delayMs?: number;
  /**
   * Test-only: when true, the next analyze() rejects (then clears).
   * Ordinary user text never fails.
   */
  shouldFail?: () => boolean;
};

/** FNV-1a style hash — stable across sessions for the same string. */
export function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function classificationForScore(score: number): string {
  if (score >= 70) return "Potentially AI-generated";
  if (score >= 40) return "Mixed signals";
  return "Likely human-written";
}

/**
 * Candidate highlight spans from the submitted text (sentences / lines).
 * Ranges are inclusive-start, exclusive-end into the original string.
 */
export function findHighlightCandidates(
  text: string,
): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  if (!text) return spans;

  const re = /[^\s](?:[\s\S]*?[.!?…]+|(?:[\s\S]*?(?:\n+|$)))/gu;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const raw = match[0];
    const start = match.index;
    let end = start + raw.length;
    /* Trim trailing whitespace from the span end for cleaner marks. */
    while (end > start && /\s/.test(text[end - 1]!)) end -= 1;
    if (end - start >= 12) {
      spans.push({ start, end });
    }
    if (match[0].length === 0) re.lastIndex += 1;
  }

  if (spans.length === 0 && text.trim().length >= 8) {
    const start = text.search(/\S/);
    const end = text.trimEnd().length;
    if (start >= 0 && end > start) spans.push({ start, end });
  }

  return spans;
}

function pickHighlights(
  text: string,
  seed: number,
): DetectionHighlightRange[] {
  const candidates = findHighlightCandidates(text);
  if (candidates.length === 0) return [];

  const count = Math.min(candidates.length, 1 + (seed % 3));
  const startIndex = seed % candidates.length;
  const picked: DetectionHighlightRange[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    const idx = (startIndex + i * 2) % candidates.length;
    if (used.has(idx)) continue;
    used.add(idx);
    const span = candidates[idx]!;
    if (span.end > span.start && span.start < text.length) {
      picked.push({
        start: span.start,
        end: Math.min(span.end, text.length),
        category: "highly-likely",
      });
    }
  }

  return picked.sort((a, b) => a.start - b.start);
}

/** Pure deterministic result — same input ⇒ same output. */
export function generateMockDetectionResult(text: string): DetectionResultData {
  const seed = hashText(text);
  const score = clampDetectionScore(5 + (seed % 9000) / 100);
  return {
    text,
    score: Number(score.toFixed(2)),
    classification: classificationForScore(score),
    highlights: pickHighlights(text, seed),
    legend: [HIGHLY_LIKELY_LEGEND],
  };
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      reject(err);
      return;
    }
    const id = globalThis.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      globalThis.clearTimeout(id);
      const err = new Error("Aborted");
      err.name = "AbortError";
      reject(err);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function createMockDetectionService(
  options: MockDetectionServiceOptions = {},
): DetectionService {
  const delayMs = options.delayMs ?? MOCK_DETECTION_DELAY_MS;
  const shouldFail = options.shouldFail;

  return {
    async analyze(text, { signal }) {
      await delay(delayMs, signal);
      if (signal.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      if (shouldFail?.()) {
        throw new Error("Mock detection failure");
      }
      return generateMockDetectionResult(text);
    },
  };
}
