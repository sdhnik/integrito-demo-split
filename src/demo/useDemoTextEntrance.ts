import { useLayoutEffect, useRef, useState } from "react";
import { revealEase } from "./useDemoResultReveal";

export const DEMO_TEXT_ENTRANCE_MS = 1200;

function prefersReducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

type Options = {
  /** True while phase is text-preview | processing | result (even if ineligible). */
  samplePhase: boolean;
  /** True when the sample document is actually shown. */
  active: boolean;
  durationMs?: number;
};

/**
 * Progressive top→bottom sample text entrance (shared progress 0…1).
 * Does not replay after focus/blur while still in a sample phase.
 * Resets when leaving sample phases (e.g. Hero / idle).
 */
export function useDemoTextEntrance({
  samplePhase,
  active,
  durationMs = DEMO_TEXT_ENTRANCE_MS,
}: Options) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const linearT = useRef(0);
  const completed = useRef(false);

  useLayoutEffect(() => {
    cancelAnimationFrame(frame.current);

    if (!samplePhase) {
      linearT.current = 0;
      completed.current = false;
      setProgress(0);
      return;
    }

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
    return () => cancelAnimationFrame(frame.current);
  }, [samplePhase, active, durationMs]);

  return {
    progress,
    complete: progress >= 1 - 1e-6,
  };
}
