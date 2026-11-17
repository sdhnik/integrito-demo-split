import { useLayoutEffect, useRef, useState } from "react";

/** Shared open/collapse duration (~400–550ms range). */
export const RESULT_PANEL_MS = 480;
export const RESULT_PANEL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

type Options = {
  /** Eligible demo result is showing. */
  open: boolean;
  /** Immediate teardown (user takeover / draft) — skip collapse animation. */
  instantClose: boolean;
  durationMs?: number;
};

/**
 * In-flow result panel open/close — interruptible.
 * Mid-collapse + open again expands from the current height (no 0 reset).
 * Mid-expand + close collapses from the current height.
 */
export function useDemoResultPanel({
  open,
  instantClose,
  durationMs = RESULT_PANEL_MS,
}: Options) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open && prefersReducedMotion());
  const [instant, setInstant] = useState(false);
  const closeTimer = useRef(0);
  const openRaf = useRef(0);
  const mountedRef = useRef(mounted);
  mountedRef.current = mounted;

  useLayoutEffect(() => {
    window.clearTimeout(closeTimer.current);
    cancelAnimationFrame(openRaf.current);

    if (open) {
      setInstant(false);
      const wasMounted = mountedRef.current;
      setMounted(true);

      if (prefersReducedMotion()) {
        setExpanded(true);
        return;
      }

      /*
        Already in the tree (e.g. user reversed mid-collapse):
        expand from the live height — do not force 0fr first.
      */
      if (wasMounted) {
        setExpanded(true);
        return;
      }

      /* Fresh mount: start collapsed, then open so the CSS transition runs. */
      setExpanded(false);
      openRaf.current = requestAnimationFrame(() => {
        openRaf.current = requestAnimationFrame(() => {
          setExpanded(true);
        });
      });
      return () => cancelAnimationFrame(openRaf.current);
    }

    /* Closing */
    if (instantClose || prefersReducedMotion()) {
      setInstant(true);
      setExpanded(false);
      setMounted(false);
      return;
    }

    if (!mountedRef.current) return;

    setInstant(false);
    setExpanded(false);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
    }, durationMs);

    return () => window.clearTimeout(closeTimer.current);
  }, [open, instantClose, durationMs]);

  return {
    mounted,
    expanded,
    instant,
    durationMs,
  };
}
