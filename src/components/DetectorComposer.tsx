import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { SAMPLE_DETECTION_REPORT } from "../data/sampleDocument";
import { useDemoExperience } from "../demo/DemoExperienceContext";
import { useDemoPresence } from "../demo/useDemoPresence";
import {
  RESULT_PANEL_EASE,
  RESULT_PANEL_MS,
  useDemoResultPanel,
} from "../demo/useDemoResultPanel";
import { useDemoResultReveal } from "../demo/useDemoResultReveal";
import { useDemoTextEntrance } from "../demo/useDemoTextEntrance";
import { useRealDetection } from "../detection/RealDetectionContext";
import type { DetectionResultData } from "../detection/detectionResult";
import {
  countWords,
  estimatePages,
  formatPageEstimate,
  isOverDetectionWordLimit,
  MAX_DETECTION_WORDS,
  PAGE_ESTIMATE_HINT,
} from "../utils/textMetrics";
import ComposerExpandBackdrop from "./ComposerExpandBackdrop";
import DetectorResultView, {
  DetectorResultDocument,
} from "./DetectorResultView";
import "./DetectorComposer.css";

const PROCESSING_EXIT_MS = 250;
const DEMO_DOC_EXIT_MS = 250;
const EXPAND_EXIT_MS = 250;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Detector editor surface.
 * Demo scroll lifecycle + user-initiated mock/real check (Step 7.2B.2).
 */
function DetectorComposer() {
  const {
    displayText,
    isDemoPreview,
    isDemoProcessing,
    isDemoResult,
    isDemoSample,
    composerExpanded,
    setComposerExpanded,
    setEditorFocused,
    setUserDraft,
    clearUserDraft,
    state,
  } = useDemoExperience();
  const {
    check,
    startCheck,
    resetCheck,
    hasDetectionService,
  } = useRealDetection();
  const [notice, setNotice] = useState("");
  const [slotHeight, setSlotHeight] = useState<number | null>(null);
  const [expandExiting, setExpandExiting] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const expandBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollLockY = useRef(0);
  const pageEstimateId = useId();
  const titleId = useId();
  const fieldId = "detector-text";
  const noticeId = "detector-notice";
  const processingId = "detector-demo-processing";
  const resultId = "detector-demo-result";

  const isUserProcessing = check.phase === "processing";
  const isUserResult = check.phase === "result" && check.result != null;
  const isUserError = check.phase === "error";
  const isUserCheckSurface =
    isUserProcessing || isUserResult || isUserError;
  const userResult: DetectionResultData | null = isUserResult
    ? check.result
    : null;

  const samplePhase =
    state.phase === "text-preview" ||
    state.phase === "processing" ||
    state.phase === "result";

  const { progress: textEntrance, complete: textEntranceComplete } =
    useDemoTextEntrance({
      samplePhase,
      active: isDemoSample && !isUserCheckSurface,
    });

  const demoInstantClose =
    state.editorFocused || state.userDraft.trim().length > 0;

  const resultPanelOpen = isDemoResult || isUserResult;
  const {
    mounted: resultMounted,
    expanded: resultExpanded,
    instant: resultInstant,
  } = useDemoResultPanel({
    open: resultPanelOpen,
    instantClose: isUserResult ? false : demoInstantClose,
  });

  const { progress: revealProgress } = useDemoResultReveal({
    resultPhase: resultPanelOpen,
    active: (isDemoResult || isUserResult) && resultPanelOpen,
  });

  const { mounted: processingMounted, exiting: processingExiting } =
    useDemoPresence({
      active: isDemoProcessing && !isUserCheckSurface,
      instant: demoInstantClose,
      exitMs: PROCESSING_EXIT_MS,
    });

  const wantDemoDocument =
    !isUserCheckSurface &&
    (isDemoSample || (resultMounted && samplePhase && !demoInstantClose));
  const { mounted: demoDocMounted, exiting: demoDocExiting } = useDemoPresence({
    active: wantDemoDocument,
    instant: demoInstantClose,
    exitMs: DEMO_DOC_EXIT_MS,
  });

  const metricText = isUserCheckSurface
    ? (check.submittedText ?? "")
    : displayText;
  const wordCount = countWords(metricText);
  const pageEstimate = estimatePages(wordCount);
  const overWordLimit = isOverDetectionWordLimit(
    countWords(state.userDraft),
  );
  const detectionLimitLabel = MAX_DETECTION_WORDS.toLocaleString();
  const overLimitMessage = `This text exceeds the ${detectionLimitLabel}-word limit. Shorten it to continue.`;

  const takeControl = () => {
    setEditorFocused(true);
  };

  const onDemoPointerActivate = () => {
    takeControl();
  };

  const onDemoKeyActivate = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
    }
    takeControl();
  };

  const onEditText = () => {
    if (check.submittedText != null) {
      setUserDraft(check.submittedText);
    }
    resetCheck();
    setNotice("");
    setEditorFocused(true);
  };

  const openExpanded = useCallback(() => {
    if (expandExiting) return;
    const el = rootRef.current;
    if (el) setSlotHeight(el.getBoundingClientRect().height);
    scrollLockY.current = window.scrollY;
    setExpandExiting(false);
    setComposerExpanded(true);
  }, [expandExiting, setComposerExpanded]);

  const closeExpanded = useCallback(() => {
    if (!composerExpanded || expandExiting) return;
    if (prefersReducedMotion()) {
      setExpandExiting(false);
      setComposerExpanded(false);
      return;
    }
    setExpandExiting(true);
  }, [composerExpanded, expandExiting, setComposerExpanded]);

  useEffect(() => {
    if (!expandExiting) return;
    const id = window.setTimeout(() => {
      setExpandExiting(false);
      setComposerExpanded(false);
    }, EXPAND_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [expandExiting, setComposerExpanded]);

  /* Body scroll lock while expanded; restore scroll on close. */
  useEffect(() => {
    if (!composerExpanded) return;
    const y = scrollLockY.current;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, [composerExpanded]);

  /* Initial dialog focus — only when expanded opens, never on draft re-renders. */
  useLayoutEffect(() => {
    if (!composerExpanded) return;
    closeBtnRef.current?.focus({ preventScroll: true });
  }, [composerExpanded]);

  /*
    On close, reconcile editorFocused with actual textarea DOM focus.
    Dialog chrome previously kept ownership sticky via in-root blur suppression.
    Must not share deps with the open-focus effect — userDraft updates while
    expanded would otherwise re-focus Collapse after every keystroke.
  */
  useLayoutEffect(() => {
    if (composerExpanded) return;
    if (slotHeight == null) return;

    const ta = input.current;
    const textareaFocused = ta != null && document.activeElement === ta;
    if (!textareaFocused) {
      setEditorFocused(false);
    }

    /* Restore to Expand only when it stays available without relying on focus. */
    const restoreExpand =
      state.userDraft.trim().length > 0 || state.checkLock;
    if (restoreExpand) {
      expandBtnRef.current?.focus({ preventScroll: true });
    } else {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        active !== ta &&
        rootRef.current?.contains(active)
      ) {
        active.blur();
      }
    }
    setSlotHeight(null);
  }, [
    composerExpanded,
    slotHeight,
    setEditorFocused,
    state.userDraft,
    state.checkLock,
  ]);

  /* Simple focus trap inside the expanded dialog. */
  useEffect(() => {
    if (!composerExpanded) return;
    const root = rootRef.current;
    if (!root) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const list = [...focusable].filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [composerExpanded]);

  const paste = async () => {
    takeControl();
    try {
      const value = await navigator.clipboard.readText();
      if (value) {
        setUserDraft(value);
        const words = countWords(value);
        setNotice(isOverDetectionWordLimit(words) ? overLimitMessage : "");
      } else {
        setNotice("Your clipboard is empty.");
      }
    } catch {
      setNotice("Use Ctrl+V or ⌘V to paste into the text field.");
    }
    input.current?.focus();
  };

  const onDetectClick = () => {
    if (isDemoPreview) {
      takeControl();
      input.current?.focus();
      return;
    }
    if (isUserProcessing) return;
    if (!state.userDraft.trim()) {
      setNotice("Paste some text to get started.");
      input.current?.focus();
      return;
    }
    if (overWordLimit) {
      setNotice(overLimitMessage);
      input.current?.focus();
      return;
    }
    setNotice("");
    if (!hasDetectionService) return;
    if (check.phase === "result") {
      resetCheck();
    }
    void startCheck(state.userDraft);
  };

  const statusCopy = overWordLimit
    ? overLimitMessage
    : notice || "Your words stay in your browser in this preview.";

  /** Active result payload — user mock/real check takes priority over demo fixture. */
  const demoReport = SAMPLE_DETECTION_REPORT;
  const activeResult: DetectionResultData = userResult ?? demoReport;
  const displayProgress =
    isDemoResult || isUserResult
      ? revealProgress
      : resultMounted
        ? 1
        : 0;
  const highlightProgress = isDemoResult || isUserResult
    ? revealProgress
    : resultMounted
      ? 1
      : 0;
  const highlightsExiting =
    resultMounted &&
    !isDemoResult &&
    !isUserResult &&
    !resultExpanded;

  const showDemoDocument = demoDocMounted;
  const showUserDocument = isUserCheckSurface;
  const showDocumentSurface = showDemoDocument || showUserDocument;
  const showDemoChrome = isDemoSample || resultMounted || demoDocExiting;
  const showProcessingStatus =
    (processingMounted && !isUserCheckSurface) || isUserProcessing;

  useLayoutEffect(() => {
    if (
      !showDocumentSurface &&
      state.editorFocused &&
      input.current
    ) {
      input.current.focus({ preventScroll: true });
    }
  }, [showDocumentSurface, state.editorFocused]);

  useLayoutEffect(() => {
    if (!isUserCheckSurface) return;
    if (!state.editorFocused) return;
    /* Leaving the editable surface for a user check — drop focus ownership. */
    setEditorFocused(false);
  }, [isUserCheckSurface, state.editorFocused, setEditorFocused]);

  const labelText = showDemoChrome && !isUserCheckSurface
    ? "Demonstration"
    : isUserCheckSurface
      ? "Your text"
      : "A clearer picture starts with your text.";

  /*
    Expand is contextual: visible while the form is user-owned
    (focus, draft, or checkLock), hidden during the scroll-driven demo.
  */
  const hasUserDraft = state.userDraft.trim().length > 0;
  const showExpandButton =
    !isDemoSample &&
    (state.editorFocused ||
      hasUserDraft ||
      state.checkLock ||
      isUserCheckSurface);

  const composer = (
        <section
          ref={rootRef}
          className={`detector-composer${
            showDemoChrome && !isUserCheckSurface ? " is-demo" : ""
          }${
            isUserProcessing ||
            isDemoProcessing ||
            (processingMounted && processingExiting)
              ? " is-demo-processing"
              : ""
          }${isDemoResult || isUserResult ? " is-demo-result" : ""}${
            isUserError ? " is-user-error" : ""
          }${composerExpanded ? " is-expanded" : ""}${
            expandExiting ? " is-expand-exiting" : ""
          }`}
          aria-label="Check text for AI"
          role={composerExpanded ? "dialog" : undefined}
          aria-modal={composerExpanded ? true : undefined}
          aria-labelledby={composerExpanded ? titleId : undefined}
          data-reveal-progress={
            isDemoResult || isUserResult
              ? revealProgress.toFixed(4)
              : undefined
          }
          data-text-entrance={
            showDemoDocument ? textEntrance.toFixed(4) : undefined
          }
          data-result-panel={
            resultMounted ? (resultExpanded ? "open" : "closed") : undefined
          }
          data-check-phase={check.phase}
        >
          <div className="detector-composer__label-row">
            <p
              id={titleId}
              className="detector-composer__label detector-composer__helper"
            >
              {showDemoChrome ? (
                <span className="detector-composer__demo-meta" role="note">
                  {labelText}
                </span>
              ) : (
                <label htmlFor={fieldId}>{labelText}</label>
              )}
            </p>
            {composerExpanded ? (
              <button
                ref={closeBtnRef}
                type="button"
                className="detector-composer__icon-btn"
                aria-label="Collapse editor"
                onClick={closeExpanded}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" />
                </svg>
              </button>
            ) : (
              <button
                ref={expandBtnRef}
                type="button"
                className={`detector-composer__icon-btn detector-composer__expand-toggle${
                  showExpandButton ? " is-visible" : ""
                }`}
                aria-label="Expand editor"
                aria-hidden={!showExpandButton}
                tabIndex={showExpandButton ? 0 : -1}
                onMouseDown={(e) => {
                  /* Preserve textarea focus so empty+focused Expand click is not lost to blur. */
                  if (showExpandButton) e.preventDefault();
                }}
                onClick={openExpanded}
                onBlur={(e) => {
                  const next = e.relatedTarget as Node | null;
                  if (next && rootRef.current?.contains(next)) return;
                  if (!hasUserDraft && !state.checkLock) {
                    setEditorFocused(false);
                  }
                }}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" />
                </svg>
              </button>
            )}
          </div>
          <form
            className="detector-composer__prompt"
            onSubmit={(e) => {
              e.preventDefault();
              onDetectClick();
            }}
          >
            {resultMounted ? (
              <div
                className={`detector-composer__result-shell${
                  resultExpanded ? " is-open" : ""
                }${resultInstant ? " is-instant" : ""}`}
                style={
                  {
                    "--result-panel-ms": `${RESULT_PANEL_MS}ms`,
                    "--result-panel-ease": RESULT_PANEL_EASE,
                  } as CSSProperties
                }
              >
                <div className="detector-composer__result-clip">
                  <DetectorResultView
                    id={resultId}
                    result={activeResult}
                    revealProgress={displayProgress}
                    ariaLabel={
                      isUserResult
                        ? "AI detection preview result"
                        : "AI detection demonstration result. Activate to edit your own text."
                    }
                    ariaBusy={
                      (isDemoResult || isUserResult) && revealProgress < 1
                    }
                    ariaHidden={!resultExpanded}
                    tabIndex={
                      showDemoDocument && resultExpanded ? 0 : undefined
                    }
                    onPointerActivate={
                      showDemoDocument ? onDemoPointerActivate : undefined
                    }
                    onFocusActivate={
                      showDemoDocument ? onDemoPointerActivate : undefined
                    }
                    onKeyActivate={
                      showDemoDocument ? onDemoKeyActivate : undefined
                    }
                  />
                </div>
              </div>
            ) : null}

            {isUserError ? (
              <div
                className="detector-composer__error"
                role="alert"
                aria-live="assertive"
              >
                <p className="detector-composer__error-message">
                  {check.error?.message ??
                    "Detection could not be completed. Please try again."}
                </p>
                <div className="detector-composer__error-actions">
                  <button
                    type="button"
                    className="detector-composer__edit"
                    onClick={onEditText}
                  >
                    Edit text
                  </button>
                  <button
                    type="button"
                    className="detector-composer__retry"
                    onClick={() => {
                      if (check.submittedText) {
                        void startCheck(check.submittedText);
                      }
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            <div className="detector-composer__editor">
              <div className="detector-composer__editor-inner">
                {showDocumentSurface ? (
                  <>
                    <div
                      className={`detector-composer__document${
                        showUserDocument || textEntranceComplete
                          ? " is-text-ready"
                          : ""
                      }${highlightsExiting ? " is-highlights-exiting" : ""}${
                        demoDocExiting ? " is-demo-exiting" : ""
                      }`}
                      tabIndex={
                        showDemoDocument && !demoDocExiting ? 0 : undefined
                      }
                      role="article"
                      aria-label={
                        showUserDocument
                          ? "Submitted document"
                          : "Sample document. Activate to edit your own text."
                      }
                      style={
                        showDemoDocument
                          ? ({
                              "--text-entrance": String(textEntrance),
                            } as CSSProperties)
                          : undefined
                      }
                      onFocus={
                        showDemoDocument ? onDemoPointerActivate : undefined
                      }
                      onClick={
                        showDemoDocument ? onDemoPointerActivate : undefined
                      }
                      onKeyDown={
                        showDemoDocument ? onDemoKeyActivate : undefined
                      }
                    >
                      <DetectorResultDocument
                        className="detector-composer__document-text"
                        result={
                          showUserDocument
                            ? {
                                text: check.submittedText ?? "",
                                score: activeResult.score,
                                classification: activeResult.classification,
                                highlights: isUserResult
                                  ? activeResult.highlights
                                  : [],
                                legend: activeResult.legend,
                              }
                            : demoReport
                        }
                        revealProgress={
                          showUserDocument
                            ? isUserResult
                              ? highlightProgress
                              : 0
                            : highlightProgress
                        }
                      />
                    </div>
                    {showProcessingStatus ? (
                      <p
                        id={processingId}
                        className={`detector-composer__processing${
                          !isUserProcessing && processingExiting
                            ? " is-exiting"
                            : ""
                        }`}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <span className="detector-composer__processing-label">
                          {isUserProcessing
                            ? "Simulating analysis"
                            : "Analyzing sample text"}
                        </span>
                        <span
                          className="detector-composer__dots"
                          aria-hidden="true"
                        >
                          <span className="detector-composer__dot" />
                          <span className="detector-composer__dot" />
                          <span className="detector-composer__dot" />
                        </span>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <textarea
                    id={fieldId}
                    ref={input}
                    value={displayText}
                    placeholder="Paste your text to check for AI…"
                    onChange={(e) => {
                      setUserDraft(e.target.value);
                      if (notice) setNotice("");
                    }}
                    onFocus={() => {
                      setEditorFocused(true);
                    }}
                    onBlur={(e) => {
                      const next = e.relatedTarget as Node | null;
                      /*
                        Ignore blur when focus moves to Expand/Collapse or other
                        composer chrome so the Expand click is not lost and
                        demo eligibility does not flicker.
                      */
                      if (next && rootRef.current?.contains(next)) return;
                      setEditorFocused(false);
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.metaKey || e.ctrlKey) &&
                        e.key === "Enter" &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        onDetectClick();
                      }
                    }}
                    aria-invalid={overWordLimit || undefined}
                    aria-describedby={`${noticeId} ${pageEstimateId}`}
                  />
                )}
              </div>
            </div>
            <div className="detector-composer__toolbar">
              <div className="detector-composer__tools">
                {isUserResult ? (
                  <button
                    type="button"
                    className="detector-composer__edit"
                    onClick={onEditText}
                  >
                    Edit text
                  </button>
                ) : isUserError ? null : (
                  <button
                    type="button"
                    className="detector-composer__paste"
                    onClick={() => void paste()}
                    disabled={isUserProcessing}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <rect x="5" y="5" width="10" height="12" rx="1.5" />
                      <path d="M7 5V3h6v2M8 9h4m-4 3h4" />
                    </svg>
                    Paste text
                  </button>
                )}
                <span
                  className={`detector-composer__count${
                    overWordLimit && !isUserCheckSurface ? " is-over-limit" : ""
                  }`}
                  aria-label={`${wordCount.toLocaleString()} of ${detectionLimitLabel} words, ${formatPageEstimate(pageEstimate)}`}
                >
                  <span className="detector-composer__count-words">
                    {wordCount.toLocaleString()} /{" "}
                    <span className="detector-composer__limit">
                      {detectionLimitLabel}
                    </span>
                    <span className="detector-composer__count-label">
                      {" "}
                      words
                    </span>
                  </span>
                  <span className="detector-composer__sep" aria-hidden="true">
                    {" "}
                    ·{" "}
                  </span>
                  <span
                    className="detector-composer__pages"
                    title={PAGE_ESTIMATE_HINT}
                  >
                    {formatPageEstimate(pageEstimate)}
                  </span>
                </span>
                <span id={pageEstimateId} className="sr-only">
                  {PAGE_ESTIMATE_HINT}
                </span>
                {!isDemoPreview &&
                !isUserCheckSurface &&
                state.userDraft ? (
                  <button
                    type="button"
                    className="detector-composer__clear"
                    onClick={() => {
                      clearUserDraft();
                      setNotice("");
                      input.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                className="detector-composer__detect"
                disabled={
                  overWordLimit ||
                  (showDemoChrome && !isUserCheckSurface) ||
                  isUserProcessing
                }
                title={
                  isUserProcessing
                    ? "Analysis in progress"
                    : showDemoChrome && !isUserCheckSurface
                      ? "Interact with the editor to use your own text"
                      : overWordLimit
                        ? overLimitMessage
                        : undefined
                }
              >
                {isUserError
                  ? "Retry"
                  : isUserProcessing
                    ? "Detecting…"
                    : "Detect AI"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
          <div className="detector-composer__footnote">
            <span
              id={noticeId}
              className="detector-composer__helper"
              role="status"
              aria-live="polite"
            >
              {isUserResult
                ? "Preview result · No live AI analysis"
                : isUserProcessing
                  ? "Simulating analysis · No live AI analysis"
                  : isUserError
                    ? "Preview check failed · No live AI analysis"
                    : isDemoResult
                      ? "Predefined sample result · Not a live detection"
                      : isDemoProcessing
                        ? "Preview only · No live analysis"
                        : isDemoPreview
                          ? "Sample document for demonstration — your draft stays empty until you edit."
                          : resultMounted
                            ? "Predefined sample result · Not a live detection"
                            : processingMounted
                              ? "Preview only · No live analysis"
                              : demoDocMounted
                                ? "Sample document for demonstration — your draft stays empty until you edit."
                                : statusCopy}
            </span>
            <span className="detector-composer__shortcut">
              ⌘ / Ctrl + Enter
            </span>
          </div>
        </section>
  );

  return (
    <>
      <ComposerExpandBackdrop
        open={composerExpanded}
        exiting={expandExiting}
        onClose={closeExpanded}
      />
      <div className="detector-composer-slot">
        {composerExpanded && slotHeight != null ? (
          <div
            className="detector-composer-slot__spacer"
            style={{ height: slotHeight }}
            aria-hidden="true"
          />
        ) : null}
        {/*
          Portal when expanded so position:fixed escapes transformed ancestors
          (sticky rail / spiral) and stacks above the backdrop.
        */}
        {composerExpanded && typeof document !== "undefined"
          ? createPortal(composer, document.body)
          : composer}
      </div>
    </>
  );
}

export default DetectorComposer;
