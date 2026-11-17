/**
 * Presentational AI detection result contract.
 * Driven by whatever the orchestration layer supplies (demo fixture or future API).
 * Not an API schema — only fields required by the current UI.
 */

/** Highlight category used by the current purple “Highly likely” marks. */
export type DetectionHighlightCategory = "highly-likely";

export type DetectionHighlightRange = {
  start: number;
  end: number;
  category: DetectionHighlightCategory;
};

export type DetectionResultLegendItem = {
  category: DetectionHighlightCategory;
  label: string;
};

/**
 * Data required to render the existing result presentation:
 * score summary, classification, progress bar, legend, and highlighted text.
 */
export type DetectionResultData = {
  /** Full analyzed document text (offsets must match highlights). */
  text: string;
  /** AI detection percentage in the closed range 0–100. */
  score: number;
  /** Human-readable classification (e.g. “Potentially AI-generated”). */
  classification: string;
  /** Inclusive-exclusive character ranges into `text`. */
  highlights: DetectionHighlightRange[];
  /** Legend rows shown under the score bar. */
  legend: DetectionResultLegendItem[];
};

export const HIGHLY_LIKELY_LEGEND: DetectionResultLegendItem = {
  category: "highly-likely",
  label: "Highly likely",
};

/** Clamp a score into the displayable 0–100 range. */
export function clampDetectionScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
}

/** Score display synced to shared reveal progress — exact final at completion. */
export function formatRevealScore(finalScore: number, progress: number): string {
  const score = clampDetectionScore(finalScore);
  if (progress >= 1) return score.toFixed(2);
  return (score * Math.min(1, Math.max(0, progress))).toFixed(2);
}

export function revealScoreValue(finalScore: number, progress: number): number {
  const score = clampDetectionScore(finalScore);
  if (progress >= 1) return score;
  return score * Math.min(1, Math.max(0, progress));
}
