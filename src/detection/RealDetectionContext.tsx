import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createConfiguredDetectionService } from "./createConfiguredDetectionService";
import {
  createRealCheckSession,
  type RealCheckSession,
} from "./createRealCheckSession";
import type { DetectionService } from "./detectionService";
import {
  INITIAL_REAL_CHECK_STATE,
  type RealCheckState,
} from "./realCheckState";

type RealDetectionApi = {
  /** Real check lifecycle — independent of demo / expand presentation. */
  check: RealCheckState;
  /** Start a real check via the configured DetectionService (mock or future API). */
  startCheck: (text: string) => Promise<void>;
  cancelCheck: () => void;
  resetCheck: () => void;
  hasDetectionService: boolean;
};

const RealDetectionContext = createContext<RealDetectionApi | null>(null);

type ProviderProps = {
  children: ReactNode;
  /**
   * Optional override (tests). When omitted, uses createConfiguredDetectionService()
   * (mock in DEV / when VITE_DETECTION_MODE=mock; otherwise disabled).
   */
  service?: DetectionService | null;
};

/**
 * Survives compact ↔ expanded dialog switches (lives above DetectorComposer).
 */
export function RealDetectionProvider({
  children,
  service: serviceProp,
}: ProviderProps) {
  const [check, setCheck] = useState<RealCheckState>(INITIAL_REAL_CHECK_STATE);
  const sessionRef = useRef<RealCheckSession | null>(null);
  const service = useMemo(
    () =>
      serviceProp !== undefined
        ? serviceProp
        : createConfiguredDetectionService(),
    [serviceProp],
  );

  useEffect(() => {
    if (!service) {
      sessionRef.current = null;
      setCheck(INITIAL_REAL_CHECK_STATE);
      return;
    }

    const session = createRealCheckSession({ service });
    sessionRef.current = session;
    setCheck(session.getState());
    const unsubscribe = session.subscribe(setCheck);

    return () => {
      unsubscribe();
      session.dispose();
      if (sessionRef.current === session) {
        sessionRef.current = null;
      }
    };
  }, [service]);

  const startCheck = useCallback(async (text: string) => {
    await sessionRef.current?.start(text);
  }, []);

  const cancelCheck = useCallback(() => {
    sessionRef.current?.cancel();
  }, []);

  const resetCheck = useCallback(() => {
    sessionRef.current?.reset();
  }, []);

  const api = useMemo<RealDetectionApi>(
    () => ({
      check,
      startCheck,
      cancelCheck,
      resetCheck,
      hasDetectionService: service != null,
    }),
    [check, startCheck, cancelCheck, resetCheck, service],
  );

  return (
    <RealDetectionContext.Provider value={api}>
      {children}
    </RealDetectionContext.Provider>
  );
}

export function useRealDetection(): RealDetectionApi {
  const ctx = useContext(RealDetectionContext);
  if (!ctx) {
    throw new Error(
      "useRealDetection must be used within RealDetectionProvider",
    );
  }
  return ctx;
}
