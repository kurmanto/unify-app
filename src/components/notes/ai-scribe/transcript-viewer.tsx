"use client";

import { useRef, useEffect } from "react";
import type { TranscriptWord } from "@/types";

interface TranscriptViewerProps {
  interimText: string;
  finalTranscript: string;
  words: TranscriptWord[];
  audioElement: HTMLAudioElement | null;
  currentTime: number;
}

export function TranscriptViewer({
  interimText,
  finalTranscript,
  words,
  audioElement,
  currentTime,
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new text arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [interimText, finalTranscript]);

  // If we have word-level timestamps and an audio element, render clickable words
  if (words.length > 0 && audioElement) {
    return (
      <div
        ref={containerRef}
        className="rounded-md border bg-muted/20 p-3 max-h-40 overflow-y-auto"
      >
        <p className="text-sm leading-relaxed">
          {words.map((word, i) => {
            const isCurrent =
              currentTime >= word.start && currentTime < word.end;
            return (
              <span
                key={i}
                onClick={() => {
                  audioElement.currentTime = word.start;
                }}
                className={`cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors ${
                  isCurrent
                    ? "bg-primary/20 text-primary font-medium"
                    : ""
                }`}
              >
                {word.word}{" "}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  // During recording, show interim transcript text
  const displayText = finalTranscript || interimText;
  if (!displayText) {
    return (
      <div className="rounded-md border bg-muted/20 p-3 min-h-[60px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground italic">
          Start recording to see transcript...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-md border bg-muted/20 p-3 max-h-40 overflow-y-auto"
    >
      <p className="text-sm whitespace-pre-wrap">{displayText}</p>
    </div>
  );
}
