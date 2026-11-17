/**
 * Approved sample document + detection fixture from Integrito Original
 * (`integrito.app` sampleDetectionReport).
 * Isolated from user drafts — never fabricate scores or ranges.
 */

import {
  HIGHLY_LIKELY_LEGEND,
  type DetectionResultData,
  type DetectionHighlightCategory,
  type DetectionHighlightRange,
} from "../detection/detectionResult";

export type SampleHighlightCategory = DetectionHighlightCategory;
export type SampleHighlightRange = DetectionHighlightRange;

export type SampleDetectionReport = DetectionResultData & {
  id: string;
  documentTitle: string;
  isDemo: true;
};

export const SAMPLE_DOCUMENT_TITLE = "How Small Decisions Shape Our Lives";

export const SAMPLE_DOCUMENT_TEXT = [
  "People often imagine that their lives are shaped by a few dramatic moments: moving to another country, choosing a career, or meeting someone special.",
  "",
  "However, I believe that small everyday decisions can be just as important.",
  "",
  "Every morning, we make choices without thinking much about them.",
  "",
  "We decide whether to exercise, read a book, call a friend, or spend another hour scrolling through social media.",
  "",
  "One decision may seem insignificant, but repeated choices slowly become habits.",
  "",
  "Over time, our habits influence our health, relationships, and opportunities.",
].join("\n");

/** Exact illustrative score from the product brief — never randomized. */
export const SAMPLE_DETECTION_SCORE = 81.59;

function rangeFor(snippet: string): SampleHighlightRange {
  const start = SAMPLE_DOCUMENT_TEXT.indexOf(snippet);
  if (start < 0) {
    throw new Error(`Sample highlight snippet not found: ${snippet}`);
  }
  return {
    start,
    end: start + snippet.length,
    category: "highly-likely",
  };
}

const SAMPLE_HIGHLIGHTS: SampleHighlightRange[] = [
  rangeFor(
    "However, I believe that small everyday decisions can be just as important.",
  ),
  rangeFor(
    "One decision may seem insignificant, but repeated choices slowly become habits.",
  ),
].sort((a, b) => a.start - b.start);

export const SAMPLE_DETECTION_REPORT: SampleDetectionReport = {
  id: "sample-report-v18",
  documentTitle: SAMPLE_DOCUMENT_TITLE,
  text: SAMPLE_DOCUMENT_TEXT,
  score: SAMPLE_DETECTION_SCORE,
  classification: "Potentially AI-generated",
  highlights: SAMPLE_HIGHLIGHTS,
  legend: [HIGHLY_LIKELY_LEGEND],
  isDemo: true,
};
