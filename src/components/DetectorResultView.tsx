import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  clampDetectionScore,
  formatRevealScore,
  revealScoreValue,
  type DetectionResultData,
} from "../detection/detectionResult";
import DemoHighlightedText from "./DemoHighlightedText";

export type DetectorResultViewProps = {
  result: DetectionResultData;
  /**
   * Shared visual reveal 0…1 (score, bar, highlights).
   * Orchestration owns timing; omit for a fully revealed static result.
   */
  revealProgress?: number;
  id?: string;
  className?: string;
  ariaLabel?: string;
  ariaBusy?: boolean;
  ariaHidden?: boolean;
  tabIndex?: number;
  /** Parent decides demo takeover vs future real-result policy. */
  onPointerActivate?: () => void;
  onFocusActivate?: () => void;
  onKeyActivate?: (e: ReactKeyboardEvent<HTMLElement>) => void;
};

/**
 * Presentational AI detection result summary (score, bar, legend).
 * Data-driven — no demo fixture, scroll, or ownership imports.
 */
function DetectorResultView({
  result,
  revealProgress = 1,
  id,
  className,
  ariaLabel = "AI detection result",
  ariaBusy,
  ariaHidden,
  tabIndex,
  onPointerActivate,
  onFocusActivate,
  onKeyActivate,
}: DetectorResultViewProps) {
  const score = clampDetectionScore(result.score);
  const progress = Math.min(1, Math.max(0, revealProgress));
  const displayedScore = formatRevealScore(score, progress);
  const displayedScoreValue = revealScoreValue(score, progress);
  const scoreLabel = `AI detection score ${displayedScore}%`;
  const legend =
    result.legend[0] ??
    ({ category: "highly-likely", label: "Highly likely" } as const);

  return (
    <div
      id={id}
      className={
        className
          ? `detector-composer__result ${className}`
          : "detector-composer__result"
      }
      role="region"
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
      onClick={onPointerActivate}
      onFocus={onFocusActivate}
      onKeyDown={onKeyActivate}
    >
      <p className="detector-composer__result-kicker">AI Detection Result</p>
      <div className="detector-composer__result-score-row">
        <p
          className="detector-composer__result-score"
          aria-label={scoreLabel}
        >
          {displayedScore}%
        </p>
        <div className="detector-composer__result-detail">
          <p className="detector-composer__result-class">
            {result.classification}
          </p>
          <div
            className="detector-composer__result-bar"
            role="img"
            aria-label={`Score indicator at ${displayedScore}%`}
          >
            <div className="detector-composer__result-bar-track">
              <div
                className="detector-composer__result-bar-fill"
                style={{ width: `${displayedScoreValue}%` }}
              />
            </div>
          </div>
          <p
            className="detector-composer__result-legend"
            aria-label={`${legend.label} passages marked with purple highlighting`}
          >
            <span
              className="detector-composer__result-swatch"
              aria-hidden="true"
            />
            {legend.label}
          </p>
        </div>
      </div>
    </div>
  );
}

export type DetectorResultDocumentProps = {
  result: DetectionResultData;
  revealProgress?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Highlighted analyzed document for a detection result.
 * Same data contract as DetectorResultView — parent owns layout chrome.
 */
export function DetectorResultDocument({
  result,
  revealProgress,
  className,
}: DetectorResultDocumentProps) {
  return (
    <DemoHighlightedText
      className={className}
      text={result.text}
      highlights={result.highlights}
      revealProgress={revealProgress}
    />
  );
}

export default DetectorResultView;
