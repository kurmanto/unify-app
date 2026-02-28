"use client";

import { Button } from "@/components/ui/button";
import { Mic, Pause, Play, Square } from "lucide-react";

export type RecordingState =
  | "idle"
  | "recording"
  | "paused"
  | "stopped"
  | "processing"
  | "done";

interface RecordingControlsProps {
  state: RecordingState;
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RecordingControls({
  state,
  elapsedSeconds,
  onStart,
  onPause,
  onResume,
  onStop,
}: RecordingControlsProps) {
  const isActive = state === "recording" || state === "paused";

  return (
    <div className="flex items-center gap-3">
      {/* Timer */}
      <div className="font-mono text-lg font-medium tabular-nums min-w-[56px]">
        {formatTime(elapsedSeconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {state === "idle" && (
          <Button
            size="sm"
            onClick={onStart}
            className="gap-1.5"
          >
            <Mic className="h-3.5 w-3.5" />
            Record
          </Button>
        )}

        {state === "recording" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="gap-1.5"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="gap-1.5"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          </>
        )}

        {state === "paused" && (
          <>
            <Button
              size="sm"
              onClick={onResume}
              className="gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Resume
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="gap-1.5"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Recording indicator */}
      {state === "recording" && (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
            Recording
          </span>
        </div>
      )}

      {state === "paused" && (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          Paused
        </span>
      )}
    </div>
  );
}
