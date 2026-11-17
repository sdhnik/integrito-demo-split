import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  SAMPLE_DETECTION_REPORT,
  SAMPLE_DOCUMENT_TEXT,
  type SampleDetectionReport,
} from "../data/sampleDocument";
import {
  DEMO_DESKTOP_MQ,
  INITIAL_DEMO_STATE,
  isDemoProcessing,
  isDemoResult,
  isDemoShowingSample,
  phaseForDemoStep,
  type DemoExperienceState,
  type DemoStep,
} from "./demoExperience";
import { useDemoScrollSteps } from "./useDemoScrollSteps";

type DemoExperienceApi = {
  state: DemoExperienceState;
  /** Visible composer text (draft or demo fixture — never conflated in state). */
  displayText: string;
  /** Approved Original sample report — only for eligible result phase. */
  demoReport: SampleDetectionReport | null;
  /** Demo owns the surface with sample text (preview, processing, or result). */
  isDemoSample: boolean;
  isDemoProcessing: boolean;
  isDemoResult: boolean;
  /** Alias for isDemoSample — Composer readOnly / sample display. */
  isDemoPreview: boolean;
  demoScrollEnabled: boolean;
  /** Expanded composer dialog — freezes scroll-driven demo phase. */
  composerExpanded: boolean;
  setComposerExpanded: (expanded: boolean) => void;
  step1Ref: RefObject<HTMLElement | null>;
  step2Ref: RefObject<HTMLElement | null>;
  step3Ref: RefObject<HTMLElement | null>;
  setEditorFocused: (focused: boolean) => void;
  setUserDraft: (value: string) => void;
  clearUserDraft: () => void;
  /**
   * Derived from real-check phase (processing|result|error) so user checks
   * take priority over the scroll-driven demo — not a second lock.
   */
  setCheckLock: (locked: boolean) => void;
};

const DemoExperienceContext = createContext<DemoExperienceApi | null>(null);

export function DemoExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoExperienceState>(INITIAL_DEMO_STATE);
  const [composerExpanded, setComposerExpandedState] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    try {
      return window.matchMedia(DEMO_DESKTOP_MQ).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mq = window.matchMedia(DEMO_DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const demoScrollEnabled = isDesktop && !state.checkLock;

  const applyDemoStep = useCallback((step: DemoStep) => {
    setState((prev) => {
      if (prev.checkLock) return prev;
      const phase = phaseForDemoStep(step);
      if (prev.activeStep === step && prev.phase === phase) return prev;
      return {
        ...prev,
        phase,
        activeStep: step,
      };
    });
  }, []);

  const setComposerExpanded = useCallback((expanded: boolean) => {
    setComposerExpandedState(expanded);
  }, []);

  const { step1Ref, step2Ref, step3Ref } = useDemoScrollSteps({
    enabled: demoScrollEnabled,
    paused: composerExpanded,
    onStepChange: applyDemoStep,
  });

  const setEditorFocused = useCallback((focused: boolean) => {
    setState((prev) =>
      prev.editorFocused === focused
        ? prev
        : { ...prev, editorFocused: focused },
    );
  }, []);

  const setUserDraft = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      userDraft: value,
    }));
  }, []);

  const clearUserDraft = useCallback(() => {
    setState((prev) => ({
      ...prev,
      userDraft: "",
    }));
  }, []);

  const setCheckLock = useCallback((locked: boolean) => {
    setState((prev) =>
      prev.checkLock === locked ? prev : { ...prev, checkLock: locked },
    );
  }, []);

  const isDemoSample = isDemoShowingSample(state, isDesktop);
  const processing = isDemoProcessing(state, isDesktop);
  const result = isDemoResult(state, isDesktop);
  const displayText = isDemoSample ? SAMPLE_DOCUMENT_TEXT : state.userDraft;
  const demoReport = result ? SAMPLE_DETECTION_REPORT : null;

  const api = useMemo<DemoExperienceApi>(
    () => ({
      state,
      displayText,
      demoReport,
      isDemoSample,
      isDemoProcessing: processing,
      isDemoResult: result,
      isDemoPreview: isDemoSample,
      demoScrollEnabled,
      composerExpanded,
      setComposerExpanded,
      step1Ref,
      step2Ref,
      step3Ref,
      setEditorFocused,
      setUserDraft,
      clearUserDraft,
      setCheckLock,
    }),
    [
      state,
      displayText,
      demoReport,
      isDemoSample,
      processing,
      result,
      demoScrollEnabled,
      composerExpanded,
      setComposerExpanded,
      step1Ref,
      step2Ref,
      step3Ref,
      setEditorFocused,
      setUserDraft,
      clearUserDraft,
      setCheckLock,
    ],
  );

  return (
    <DemoExperienceContext.Provider value={api}>
      {children}
    </DemoExperienceContext.Provider>
  );
}

export function useDemoExperience(): DemoExperienceApi {
  const ctx = useContext(DemoExperienceContext);
  if (!ctx) {
    throw new Error(
      "useDemoExperience must be used within DemoExperienceProvider",
    );
  }
  return ctx;
}
