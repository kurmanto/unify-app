"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "./audio-recorder";
import { Mic, MessageSquare } from "lucide-react";
import type { RecordingState } from "./recording-controls";
import type { AiSoapSuggestions } from "@/types";

interface AiScribePanelProps {
  appointmentId: string;
  clientId: string;
  sessionNumber: number | null;
  onResult: (result: {
    transcript: string;
    structured_note: AiSoapSuggestions | null;
    audio_url?: string | null;
  }) => void;
}

export function AiScribePanel({
  appointmentId,
  clientId,
  sessionNumber,
  onResult,
}: AiScribePanelProps) {
  const [mode, setMode] = useState<"dictation" | "live_intake">("dictation");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  return (
    <div className="rounded-lg border bg-card">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          if (recordingState === "idle" || recordingState === "done") {
            setMode(v as "dictation" | "live_intake");
          }
        }}
      >
        <div className="border-b px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger
              value="dictation"
              className="text-xs gap-1.5"
              disabled={recordingState !== "idle" && recordingState !== "done"}
            >
              <Mic className="h-3 w-3" />
              Post-Session Dictation
            </TabsTrigger>
            <TabsTrigger
              value="live_intake"
              className="text-xs gap-1.5"
              disabled={recordingState !== "idle" && recordingState !== "done"}
            >
              <MessageSquare className="h-3 w-3" />
              Live Intake
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          {/* Mode description */}
          <p className="text-xs text-muted-foreground mb-3">
            {mode === "dictation"
              ? "Record your post-session notes. Speak naturally — AI will structure your dictation into SOAP format."
              : "Record during client intake. AI will separate practitioner observations from client-reported symptoms."}
          </p>

          <TabsContent value="dictation" className="mt-0">
            <AudioRecorder
              appointmentId={appointmentId}
              clientId={clientId}
              sessionNumber={sessionNumber}
              recordingMode="dictation"
              onResult={onResult}
              onStateChange={setRecordingState}
            />
          </TabsContent>

          <TabsContent value="live_intake" className="mt-0">
            <AudioRecorder
              appointmentId={appointmentId}
              clientId={clientId}
              sessionNumber={sessionNumber}
              recordingMode="live_intake"
              onResult={onResult}
              onStateChange={setRecordingState}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
