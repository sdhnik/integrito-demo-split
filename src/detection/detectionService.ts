import type { DetectionResultData } from "./detectionResult";

export type DetectionAnalyzeOptions = {
  signal: AbortSignal;
};

/**
 * Minimal async detection service contract.
 * Production Detect AI is not wired to any implementation in Step 7.2B.1.
 */
export type DetectionService = {
  analyze(
    text: string,
    options: DetectionAnalyzeOptions,
  ): Promise<DetectionResultData>;
};
