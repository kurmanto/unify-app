"use client";

import { cn } from "@/lib/utils";

interface SeriesProgressRingProps {
  current: number;
  total: number;
  phase?: "sleeve" | "core" | "integration";
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getPhaseColor(phase?: string) {
  switch (phase) {
    case "sleeve":
      return "stroke-blue-500";
    case "core":
      return "stroke-amber-500";
    case "integration":
      return "stroke-emerald-500";
    default:
      return "stroke-primary";
  }
}

function getPhaseTrack(phase?: string) {
  switch (phase) {
    case "sleeve":
      return "stroke-blue-500/15";
    case "core":
      return "stroke-amber-500/15";
    case "integration":
      return "stroke-emerald-500/15";
    default:
      return "stroke-primary/15";
  }
}

export function SeriesProgressRing({
  current,
  total,
  phase,
  size = 40,
  strokeWidth = 3,
  className,
}: SeriesProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / total, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={getPhaseTrack(phase)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", getPhaseColor(phase))}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-muted-foreground">
        {current}/{total}
      </span>
    </div>
  );
}
