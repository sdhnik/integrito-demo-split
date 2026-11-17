import { useEffect } from "react";
import { useDemoExperience } from "../demo/DemoExperienceContext";
import { useRealDetection } from "./RealDetectionContext";

/**
 * Maps real-check phase → demo checkLock (single lock, no competing flag).
 * processing | result | error → locked; idle → unlocked.
 */
export function RealCheckDemoLockBridge() {
  const { check } = useRealDetection();
  const { setCheckLock } = useDemoExperience();

  useEffect(() => {
    const locked =
      check.phase === "processing" ||
      check.phase === "result" ||
      check.phase === "error";
    setCheckLock(locked);
  }, [check.phase, setCheckLock]);

  return null;
}
