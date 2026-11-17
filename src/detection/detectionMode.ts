/**
 * Detection provider mode — mock for local/preview UI testing,
 * disabled for public production until a real API adapter exists.
 *
 * Override with VITE_DETECTION_MODE=mock|disabled
 */

export type DetectionMode = "mock" | "disabled";

export function getDetectionMode(): DetectionMode {
  const raw = import.meta.env.VITE_DETECTION_MODE;
  if (raw === "mock" || raw === "disabled") return raw;
  /* Local Vite dev defaults to mock; production builds stay disabled unless set. */
  return import.meta.env.DEV ? "mock" : "disabled";
}

export function isMockDetectionEnabled(): boolean {
  return getDetectionMode() === "mock";
}
