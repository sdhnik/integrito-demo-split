/**
 * Framework-agnostic real-check session.
 * Handles AbortController, request identity, and stale response rejection.
 * Does not depend on demo scroll, editorial steps, or dialog expand state.
 */

import {
  countWords,
  isOverDetectionWordLimit,
} from "../utils/textMetrics";
import type { DetectionService } from "./detectionService";
import {
  INITIAL_REAL_CHECK_STATE,
  canStartRealCheck,
  freezeDetectionResult,
  isAbortError,
  realCheckReducer,
  toUserSafeError,
  type RealCheckAction,
  type RealCheckState,
} from "./realCheckState";

export type RealCheckSession = {
  getState: () => RealCheckState;
  subscribe: (listener: (state: RealCheckState) => void) => () => void;
  /** Start a check. No-ops when already processing or text fails validation. */
  start: (text: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  dispose: () => void;
};

export type CreateRealCheckSessionOptions = {
  service: DetectionService;
};

export function createRealCheckSession(
  options: CreateRealCheckSessionOptions,
): RealCheckSession {
  const { service } = options;
  let state: RealCheckState = INITIAL_REAL_CHECK_STATE;
  let disposed = false;
  let abortController: AbortController | null = null;
  let nextRequestId = 0;
  const listeners = new Set<(s: RealCheckState) => void>();

  const emit = () => {
    for (const listener of listeners) listener(state);
  };

  const dispatch = (action: RealCheckAction) => {
    if (disposed) return;
    const next = realCheckReducer(state, action);
    if (next === state) return;
    state = next;
    emit();
  };

  const cancelInFlight = () => {
    if (!abortController) return;
    abortController.abort();
    abortController = null;
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start: async (text: string) => {
      if (disposed) return;
      if (!canStartRealCheck(state.phase)) return;
      if (!text.trim()) return;
      if (isOverDetectionWordLimit(countWords(text))) return;

      cancelInFlight();
      const requestId = ++nextRequestId;
      const controller = new AbortController();
      abortController = controller;

      dispatch({ type: "START", text, requestId });

      try {
        const raw = await service.analyze(text, { signal: controller.signal });
        if (disposed) return;
        if (controller.signal.aborted) return;
        /* Reject stale responses from an older request id. */
        if (requestId !== state.requestId || state.phase !== "processing") {
          return;
        }

        dispatch({
          type: "SUCCESS",
          requestId,
          result: freezeDetectionResult(raw),
        });
      } catch (err) {
        if (disposed) return;
        if (controller.signal.aborted || isAbortError(err)) {
          /* Cancellation is not a detection failure. */
          return;
        }
        if (requestId !== state.requestId || state.phase !== "processing") {
          return;
        }

        dispatch({
          type: "FAILURE",
          requestId,
          error: toUserSafeError(err),
        });
      } finally {
        if (abortController === controller) {
          abortController = null;
        }
      }
    },
    cancel: () => {
      if (disposed) return;
      if (state.phase !== "processing") return;
      cancelInFlight();
      dispatch({ type: "CANCEL" });
    },
    reset: () => {
      if (disposed) return;
      if (state.phase === "processing") {
        cancelInFlight();
        dispatch({ type: "CANCEL" });
        return;
      }
      dispatch({ type: "RESET" });
    },
    dispose: () => {
      disposed = true;
      cancelInFlight();
      listeners.clear();
    },
  };
}
