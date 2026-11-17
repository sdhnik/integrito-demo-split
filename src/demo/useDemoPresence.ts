import { useLayoutEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

type Options = {
  /** Desired visible state from the demo lifecycle. */
  active: boolean;
  /** Skip exit animation (takeover / draft / reduced-motion). */
  instant: boolean;
  exitMs: number;
};

/**
 * Keep an element mounted through a short CSS exit, and support interrupt.
 * active↑ → mount (enter CSS on fresh mount).
 * active↓ → exiting class, then unmount after exitMs.
 * active↑ during exit → cancel timer, clear exiting (no stale callbacks).
 */
export function useDemoPresence({ active, instant, exitMs }: Options) {
  const [mounted, setMounted] = useState(active);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef(0);
  const mountedRef = useRef(mounted);
  mountedRef.current = mounted;

  useLayoutEffect(() => {
    window.clearTimeout(exitTimer.current);

    if (active) {
      setMounted(true);
      setExiting(false);
      return;
    }

    if (!mountedRef.current) return;

    if (instant || prefersReducedMotion()) {
      setExiting(false);
      setMounted(false);
      return;
    }

    setExiting(true);
    exitTimer.current = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, exitMs);

    return () => window.clearTimeout(exitTimer.current);
  }, [active, instant, exitMs]);

  return { mounted, exiting };
}
