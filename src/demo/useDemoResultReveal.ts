import { useLayoutEffect, useRef, useState } from "react";

export const RESULT_REVEAL_MS = 1500;
/** Wait for result panel entrance before score/highlight reveal. */
export const RESULT_REVEAL_DELAY_MS = 480;

/** Approximate cubic-bezier(0.22, 1, 0.36, 1). */
export function revealEase(t: number): number {
  const p = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - p, 3.6);
}

function prefersReducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

type Options = {
  /** True while How It Works is on Step 3 (phase === result), even if ineligible. */
  resultPhase: boolean;
  /** True when the demo result is actually shown (eligible + result). */
  active: boolean;
  durationMs?: number;
  /** Delay before first start (panel entrance). Skipped on resume. */
  delayMs?: number;
};

/**
 * Single shared reveal progress 0 → 1 for score, bar, and highlights.
 * - Entering Step 3 starts (or resumes) the reveal after delayMs.
 * - Leaving Step 3 cancels and resets.
 * - Temporary focus/ineligibility pauses without resetting a completed reveal.
 */
export function useDemoResultReveal({
  resultPhase,
  active,
  durationMs = RESULT_REVEAL_MS,
  delayMs = RESULT_REVEAL_DELAY_MS,
}: Options) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const delayTimer = useRef(0);
  /** Linear time 0…1 before easing — used for pause/resume. */
  const linearT = useRef(0);
  const completed = useRef(false);

  useLayoutEffect(() => {
    cancelAnimationFrame(frame.current);
    window.clearTimeout(delayTimer.current);

    if (!resultPhase) {
      linearT.current = 0;
      completed.current = false;
      setProgress(0);
      return;
    }

    /* Still on Step 3 but demo hidden (focus / draft) — pause, keep progress. */
    if (!active) {
      return;
    }

    if (completed.current || linearT.current >= 1) {
      linearT.current = 1;
      completed.current = true;
      setProgress(1);
      return;
    }

    if (prefersReducedMotion()) {
      linearT.current = 1;
      completed.current = true;
      setProgress(1);
      return;
    }

    const run = () => {
      const startLinear = linearT.current;
      const start = performance.now() - startLinear * durationMs;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        linearT.current = t;
        if (t >= 1) {
          completed.current = true;
          setProgress(1);
          return;
        }
        setProgress(revealEase(t));
        frame.current = requestAnimationFrame(tick);
      };

      frame.current = requestAnimationFrame(tick);
    };

    /* Fresh start waits for panel entrance; resume continues immediately. */
    if (linearT.current <= 0 && delayMs > 0) {
      delayTimer.current = window.setTimeout(run, delayMs);
    } else {
      run();
    }

    return () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(delayTimer.current);
    };
  }, [resultPhase, active, durationMs, delayMs]);

  return {
    progress,
    complete: progress >= 1 - 1e-6,
  };
}

export {
  formatRevealScore,
  revealScoreValue,
} from "../detection/detectionResult";
