import type { TenSeriesSession } from "@/lib/rolfing/ten-series";

export function getSessionPhase(currentSession: number): TenSeriesSession["phase"] | null {
  if (currentSession <= 0) return "sleeve";
  if (currentSession <= 3) return "sleeve";
  if (currentSession <= 7) return "core";
  if (currentSession <= 10) return "integration";
  return null;
}
