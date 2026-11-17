import { useEffect, useRef, useState } from "react";
import type { DemoStep } from "./demoExperience";

type Options = {
  /** When false (mobile / check lock), do not drive steps from scroll. */
  enabled: boolean;
  /**
   * Pause observer without resetting the active step
   * (e.g. composer expanded — freeze the visible demo phase).
   */
  paused?: boolean;
  onStepChange: (step: DemoStep) => void;
};

/** Minimal settle window to limit reading-band flicker without feeling laggy. */
const STEP_SETTLE_MS = 56;

/**
 * Section-aware How It Works activation via IntersectionObserver.
 * Active step = highest numbered step intersecting the reading band.
 * Short settle prevents rapid oscillation at section boundaries.
 */
export function useDemoScrollSteps({
  enabled,
  paused = false,
  onStepChange,
}: Options) {
  const step1Ref = useRef<HTMLElement | null>(null);
  const step2Ref = useRef<HTMLElement | null>(null);
  const step3Ref = useRef<HTMLElement | null>(null);
  const [activeStep, setActiveStep] = useState<DemoStep>(null);
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  const lastStep = useRef<DemoStep>(null);
  const pendingStep = useRef<DemoStep | undefined>(undefined);
  const settleTimer = useRef(0);

  useEffect(() => {
    if (!enabled) {
      window.clearTimeout(settleTimer.current);
      pendingStep.current = undefined;
      lastStep.current = null;
      setActiveStep(null);
      onStepChangeRef.current(null);
      return;
    }

    /* Freeze: keep last committed step; do not observe or reset. */
    if (paused) {
      window.clearTimeout(settleTimer.current);
      pendingStep.current = undefined;
      return;
    }

    const targets: { step: Exclude<DemoStep, null>; el: HTMLElement | null }[] =
      [
        { step: 1, el: step1Ref.current },
        { step: 2, el: step2Ref.current },
        { step: 3, el: step3Ref.current },
      ];

    const intersecting = new Set<Exclude<DemoStep, null>>();

    const compute = (): DemoStep => {
      let next: DemoStep = null;
      for (const step of [1, 2, 3] as const) {
        if (intersecting.has(step)) next = step;
      }
      return next;
    };

    const commit = (next: DemoStep) => {
      if (next === lastStep.current) return;
      lastStep.current = next;
      setActiveStep(next);
      onStepChangeRef.current(next);
    };

    const publish = () => {
      const next = compute();
      if (next === lastStep.current) {
        /* Flicker resolved back to current — cancel pending flip. */
        window.clearTimeout(settleTimer.current);
        pendingStep.current = undefined;
        return;
      }
      if (pendingStep.current === next) return;

      window.clearTimeout(settleTimer.current);
      pendingStep.current = next;
      settleTimer.current = window.setTimeout(() => {
        pendingStep.current = undefined;
        /* Re-read in case the band changed during the settle window. */
        commit(compute());
      }, STEP_SETTLE_MS);
    };

    /*
      Reading band ~30%–55% from top of viewport.
      Brand Intro / Hero outside the band → no How It Works step active.
    */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const raw = entry.target.getAttribute("data-demo-step");
          const step = Number(raw) as Exclude<DemoStep, null>;
          if (step !== 1 && step !== 2 && step !== 3) continue;
          if (entry.isIntersecting) intersecting.add(step);
          else intersecting.delete(step);
        }
        publish();
      },
      {
        root: null,
        rootMargin: "-30% 0px -45% 0px",
        threshold: 0,
      },
    );

    for (const { step, el } of targets) {
      if (!el) continue;
      el.setAttribute("data-demo-step", String(step));
      observer.observe(el);
    }

    publish();

    return () => {
      window.clearTimeout(settleTimer.current);
      observer.disconnect();
    };
  }, [enabled, paused]);

  return { step1Ref, step2Ref, step3Ref, activeStep };
}
