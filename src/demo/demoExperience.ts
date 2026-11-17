/**
 * Scroll-driven detector demo — shared types & pure helpers.
 * Step 6.1–6.3C.4: idle | text-preview | processing | result.
 */

export type DemoPhase = "idle" | "text-preview" | "processing" | "result";

/** How It Works step under the reading band; null = Hero / Brand Intro. */
export type DemoStep = null | 1 | 2 | 3;

export type DemoExperienceState = {
  phase: DemoPhase;
  activeStep: DemoStep;
  /** Real user draft — never stores the automatic demo fixture. */
  userDraft: string;
  /** While focused, automatic demo content must not display. */
  editorFocused: boolean;
  /**
   * Locks demo after an active/submitted real check (detection workflow).
   * Reused by future API integration — do not activate until a DetectionService
   * is connected. Not a hasEverEdited flag — empty draft can restore eligibility
   * after blur when unlocked.
   */
  checkLock: boolean;
};

export const INITIAL_DEMO_STATE: DemoExperienceState = {
  phase: "idle",
  activeStep: null,
  userDraft: "",
  editorFocused: false,
  checkLock: false,
};

/**
 * Map observed How It Works step → demo phase.
 * Step 1 → text-preview
 * Step 2 → processing
 * Step 3 → result
 */
export function phaseForDemoStep(step: DemoStep): DemoPhase {
  if (step === null) return "idle";
  if (step === 1) return "text-preview";
  if (step === 2) return "processing";
  return "result";
}

/** Desktop split layout — matches StorytellingStage stacked breakpoint. */
export const DEMO_DESKTOP_MQ = "(min-width: 1200px)";

export function isDemoEligible(
  state: DemoExperienceState,
  isDesktop: boolean,
): boolean {
  return (
    isDesktop &&
    !state.editorFocused &&
    state.userDraft.trim().length === 0 &&
    !state.checkLock
  );
}

/** Sample document surface for preview, processing, and result. */
export function isDemoShowingSample(
  state: DemoExperienceState,
  isDesktop: boolean,
): boolean {
  if (!isDemoEligible(state, isDesktop)) return false;
  return (
    state.phase === "text-preview" ||
    state.phase === "processing" ||
    state.phase === "result"
  );
}

export function isDemoProcessing(
  state: DemoExperienceState,
  isDesktop: boolean,
): boolean {
  return isDemoEligible(state, isDesktop) && state.phase === "processing";
}

export function isDemoResult(
  state: DemoExperienceState,
  isDesktop: boolean,
): boolean {
  return isDemoEligible(state, isDesktop) && state.phase === "result";
}

/** @deprecated Prefer isDemoShowingSample */
export function isDemoTextPreview(
  state: DemoExperienceState,
  isDesktop: boolean,
): boolean {
  return isDemoShowingSample(state, isDesktop);
}
