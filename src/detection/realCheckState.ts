/**
 * Real user-initiated AI check lifecycle — independent of scroll-driven demo.
 * Single source of truth: one phase, not parallel booleans.
 */

import type { DetectionResultData } from "./detectionResult";

export type RealCheckPhase = "idle" | "processing" | "result" | "error";

/** User-safe error payload for a future error UI — never raw backend dumps. */
export type RealCheckError = {
  code: "request_failed" | "invalid_response";
  /** Short stable message suitable for future UI (not raw exception text). */
  message: string;
};

export type RealCheckState = {
  phase: RealCheckPhase;
  /**
   * Immutable snapshot of text submitted for the active/completed check.
   * Distinct from editable userDraft.
   */
  submittedText: string | null;
  result: DetectionResultData | null;
  error: RealCheckError | null;
  /** Monotonic id for the in-flight or last started request. */
  requestId: number;
};

export const INITIAL_REAL_CHECK_STATE: RealCheckState = {
  phase: "idle",
  submittedText: null,
  result: null,
  error: null,
  requestId: 0,
};

export type RealCheckAction =
  | { type: "START"; text: string; requestId: number }
  | { type: "SUCCESS"; requestId: number; result: DetectionResultData }
  | { type: "FAILURE"; requestId: number; error: RealCheckError }
  | { type: "CANCEL" }
  | { type: "RESET" };

export function canStartRealCheck(phase: RealCheckPhase): boolean {
  return phase === "idle" || phase === "error";
}

/**
 * Transitions:
 * idle → processing
 * processing → result | error | idle (cancel)
 * error → processing (retry)
 * result → idle (explicit reset)
 */
export function realCheckReducer(
  state: RealCheckState,
  action: RealCheckAction,
): RealCheckState {
  switch (action.type) {
    case "START": {
      if (!canStartRealCheck(state.phase)) return state;
      return {
        phase: "processing",
        submittedText: action.text,
        result: null,
        error: null,
        requestId: action.requestId,
      };
    }
    case "SUCCESS": {
      if (state.phase !== "processing") return state;
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        phase: "result",
        result: action.result,
        error: null,
      };
    }
    case "FAILURE": {
      if (state.phase !== "processing") return state;
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        phase: "error",
        result: null,
        error: action.error,
      };
    }
    case "CANCEL": {
      if (state.phase !== "processing") return state;
      return {
        ...INITIAL_REAL_CHECK_STATE,
        requestId: state.requestId,
      };
    }
    case "RESET": {
      /* Explicit clear from result/error/idle. Processing must cancel first. */
      if (state.phase === "processing") return state;
      return {
        ...INITIAL_REAL_CHECK_STATE,
        requestId: state.requestId,
      };
    }
    default:
      return state;
  }
}

/** Deep-freeze a result snapshot so UI layers cannot mutate check state. */
export function freezeDetectionResult(
  result: DetectionResultData,
): DetectionResultData {
  const frozen = Object.freeze({
    text: result.text,
    score: result.score,
    classification: result.classification,
    highlights: Object.freeze(
      result.highlights.map((h) =>
        Object.freeze({
          start: h.start,
          end: h.end,
          category: h.category,
        }),
      ),
    ),
    legend: Object.freeze(
      result.legend.map((item) =>
        Object.freeze({
          category: item.category,
          label: item.label,
        }),
      ),
    ),
  });
  return frozen as DetectionResultData;
}

export function toUserSafeError(_err: unknown): RealCheckError {
  return {
    code: "request_failed",
    message: "Detection could not be completed. Please try again.",
  };
}

export function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String((err as { name?: string }).name) : "";
  return name === "AbortError";
}
