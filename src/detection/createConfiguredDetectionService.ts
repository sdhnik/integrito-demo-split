import { getDetectionMode } from "./detectionMode";
import type { DetectionService } from "./detectionService";
import { createMockDetectionService } from "./mockDetectionService";

declare global {
  interface Window {
    /** DEV/test only — forces the next mock analyze() to fail, then clears. */
    __INTEGRITO_MOCK_FAIL_ONCE__?: boolean;
  }
}

/**
 * Resolve the active DetectionService from mode config.
 * Public production stays null unless VITE_DETECTION_MODE=mock.
 */
export function createConfiguredDetectionService(): DetectionService | null {
  if (getDetectionMode() !== "mock") return null;

  return createMockDetectionService({
    shouldFail: () => {
      if (typeof window === "undefined") return false;
      if (!window.__INTEGRITO_MOCK_FAIL_ONCE__) return false;
      window.__INTEGRITO_MOCK_FAIL_ONCE__ = false;
      return true;
    },
  });
}
