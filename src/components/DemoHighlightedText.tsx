import { useMemo, type CSSProperties } from "react";
import type { DetectionHighlightRange } from "../detection/detectionResult";

type Props = {
  text: string;
  highlights: DetectionHighlightRange[];
  className?: string;
  /**
   * Shared reveal progress 0…1.
   * When omitted, highlights render at full strength (static / complete).
   */
  revealProgress?: number;
};

type Segment = {
  text: string;
  highlighted: boolean;
  category: DetectionHighlightRange["category"] | null;
  /** Index among highlighted segments in document order (for stagger). */
  highlightIndex: number;
};

function mergeRanges(
  ranges: DetectionHighlightRange[],
): DetectionHighlightRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: DetectionHighlightRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const next = sorted[i];
    if (next.start <= prev.end) {
      prev.end = Math.max(prev.end, next.end);
    } else {
      merged.push({ ...next });
    }
  }
  return merged;
}

export function buildHighlightSegments(
  text: string,
  highlights: DetectionHighlightRange[],
): Segment[] {
  if (!text) return [];
  const local = mergeRanges(
    highlights.filter((h) => h.end > h.start && h.start < text.length),
  );
  if (local.length === 0) {
    return [
      { text, highlighted: false, category: null, highlightIndex: -1 },
    ];
  }

  const segments: Segment[] = [];
  let cursor = 0;
  let highlightIndex = 0;
  for (const h of local) {
    const start = Math.max(0, h.start);
    const end = Math.min(text.length, h.end);
    if (start > cursor) {
      segments.push({
        text: text.slice(cursor, start),
        highlighted: false,
        category: null,
        highlightIndex: -1,
      });
    }
    if (end > start) {
      segments.push({
        text: text.slice(start, end),
        highlighted: true,
        category: h.category,
        highlightIndex: highlightIndex++,
      });
    }
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlighted: false,
      category: null,
      highlightIndex: -1,
    });
  }
  return segments;
}

/** Per-passage amount from shared master progress (document order). */
export function highlightRevealAmount(
  index: number,
  count: number,
  progress: number,
): number {
  if (count <= 0) return 0;
  if (progress >= 1) return 1;
  if (progress <= 0) return 0;
  const start = index / count;
  const end = (index + 1) / count;
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

const CATEGORY_TITLE: Record<DetectionHighlightRange["category"], string> = {
  "highly-likely": "Highly likely",
};

/**
 * Plain-text document with soft purple marks for highlight ranges.
 * No dangerouslySetInnerHTML — spans / marks only.
 * Reveal animates left-to-right fill via --hl-reveal; text nodes stay stable.
 */
function DemoHighlightedText({
  text,
  highlights,
  className,
  revealProgress,
}: Props) {
  const segments = useMemo(
    () => buildHighlightSegments(text, highlights),
    [text, highlights],
  );
  const highlightCount = useMemo(
    () => segments.filter((s) => s.highlighted).length,
    [segments],
  );
  const progress = revealProgress ?? 1;

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (!segment.highlighted || !segment.category) {
          return <span key={index}>{segment.text}</span>;
        }
        const amount = highlightRevealAmount(
          segment.highlightIndex,
          highlightCount,
          progress,
        );
        const style = {
          ["--hl-reveal"]: String(amount),
        } as CSSProperties;

        return (
          <mark
            key={index}
            className="demo-ai-highlight"
            data-category={segment.category}
            data-highlight-index={segment.highlightIndex}
            title={CATEGORY_TITLE[segment.category]}
            style={style}
          >
            {segment.text}
          </mark>
        );
      })}
    </span>
  );
}

export default DemoHighlightedText;
