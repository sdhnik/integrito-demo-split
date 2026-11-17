/** Maximum words accepted for AI Text Detection. */
export const MAX_DETECTION_WORDS = 3000;

/** Approximate words per page for the Composer length estimate. */
export const WORDS_PER_PAGE = 275;

export const PAGE_ESTIMATE_HINT =
  "Estimated using 275 words per page. Actual document pages may vary.";

type WordSegmenter = {
  segment(input: string): Iterable<{ isWordLike?: boolean }>;
};

type IntlWithSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: "word" }
  ) => WordSegmenter;
};

let wordSegmenter: WordSegmenter | null | undefined;

function getWordSegmenter(): WordSegmenter | null {
  if (wordSegmenter !== undefined) return wordSegmenter;
  try {
    const IntlSeg = Intl as IntlWithSegmenter;
    if (typeof Intl !== "undefined" && typeof IntlSeg.Segmenter === "function") {
      wordSegmenter = new IntlSeg.Segmenter(undefined, { granularity: "word" });
      return wordSegmenter;
    }
  } catch {
    /* Unsupported locale / environment — fall through. */
  }
  wordSegmenter = null;
  return null;
}

/**
 * Unicode-aware word count.
 * Prefers Intl.Segmenter (isWordLike); falls back to letter/number sequences.
 */
export function countWords(text: string): number {
  if (!text || !/\S/.test(text)) return 0;

  const segmenter = getWordSegmenter();
  if (segmenter) {
    let count = 0;
    for (const part of segmenter.segment(text)) {
      if (part.isWordLike) count += 1;
    }
    return count;
  }

  const parts = text.match(/[\p{L}\p{N}]+(?:['\u2019\-][\p{L}\p{N}]+)*/gu);
  return parts ? parts.length : 0;
}

/** Estimated document pages from word count (0 → 0; otherwise ceil division). */
export function estimatePages(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.ceil(wordCount / WORDS_PER_PAGE);
}

export function formatPageEstimate(pages: number): string {
  const n = Math.max(0, pages);
  return `≈ ${n.toLocaleString()} ${n === 1 ? "page" : "pages"}`;
}

export function isOverDetectionWordLimit(wordCount: number): boolean {
  return wordCount > MAX_DETECTION_WORDS;
}
