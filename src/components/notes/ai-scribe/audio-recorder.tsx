"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { WaveformVisualizer } from "./waveform-visualizer";
import { RecordingControls, type RecordingState } from "./recording-controls";
import { TranscriptViewer } from "./transcript-viewer";
import type { TranscriptWord, AiSoapSuggestions } from "@/types";

interface AudioRecorderProps {
  appointmentId: string;
  clientId: string;
  sessionNumber: number | null;
  recordingMode: "dictation" | "live_intake";
  onResult: (result: {
    transcript: string;
    structured_note: AiSoapSuggestions | null;
    audio_url?: string | null;
  }) => void;
  onStateChange?: (state: RecordingState) => void;
}

export function AudioRecorder({
  appointmentId,
  clientId,
  sessionNumber,
  recordingMode,
  onResult,
  onStateChange,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [words, setWords] = useState<TranscriptWord[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  function updateState(newState: RecordingState) {
    setState(newState);
    onStateChange?.(newState);
  }

  // Timer
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Send interim chunks for transcription
  const sendChunkForTranscription = useCallback(async () => {
    if (chunksRef.current.length === 0) return;
    const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
    if (blob.size < 1000) return; // Skip tiny chunks

    const formData = new FormData();
    formData.append("audio", blob);

    try {
      const res = await fetch("/api/notes/transcribe-chunk", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          setInterimText(data.transcript);
        }
      }
    } catch {
      // Interim transcription failure is non-critical
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context + analyser
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(1000); // Collect data every 1s
      mediaRecorderRef.current = recorder;

      // Send chunks for interim transcription every 15 seconds
      chunkTimerRef.current = setInterval(sendChunkForTranscription, 15000);

      setElapsedSeconds(0);
      setInterimText("");
      setFinalTranscript("");
      setWords([]);
      setAudioUrl(null);
      updateState("recording");
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError("Failed to start recording. Please check your microphone.");
      }
    }
  }, [sendChunkForTranscription]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      updateState("paused");
      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
        chunkTimerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      updateState("recording");
      chunkTimerRef.current = setInterval(sendChunkForTranscription, 15000);
    }
  }, [sendChunkForTranscription]);

  const stopRecording = useCallback(async () => {
    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }

    updateState("processing");

    // Stop MediaRecorder and wait for final chunk
    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    // Stop all tracks
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }

    // Create blob from all chunks
    const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });

    // Create playback URL
    const blobUrl = URL.createObjectURL(blob);
    setAudioUrl(blobUrl);

    // Create audio element for playback
    const audio = new Audio(blobUrl);
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audioElementRef.current = audio;

    // Send full audio for transcription + AI structuring
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("appointment_id", appointmentId);
    formData.append("client_id", clientId);
    formData.append("recording_mode", recordingMode);
    if (sessionNumber) {
      formData.append("session_number", String(sessionNumber));
    }

    try {
      const res = await fetch("/api/notes/transcribe", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFinalTranscript(data.transcript || "");
        setWords(data.words || []);
        onResult({
          transcript: data.transcript || "",
          structured_note: data.structured_note,
          audio_url: data.audio_url,
        });
        updateState("done");
      } else {
        const err = await res.json();
        setError(err.error || "Transcription failed");
        updateState("done");
      }
    } catch {
      setError("Failed to process recording. Please try again.");
      updateState("done");
    }
  }, [appointmentId, clientId, sessionNumber, recordingMode, onResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Waveform */}
      <WaveformVisualizer
        analyser={analyserRef.current}
        isRecording={state === "recording" || state === "paused"}
        isPaused={state === "paused"}
      />

      {/* Controls */}
      <RecordingControls
        state={state}
        elapsedSeconds={elapsedSeconds}
        onStart={startRecording}
        onPause={pauseRecording}
        onResume={resumeRecording}
        onStop={stopRecording}
      />

      {/* Transcript */}
      <TranscriptViewer
        interimText={interimText}
        finalTranscript={finalTranscript}
        words={words}
        audioElement={audioElementRef.current}
        currentTime={currentTime}
      />

      {/* Audio playback */}
      {audioUrl && state === "done" && (
        <audio controls src={audioUrl} className="w-full h-8" />
      )}

      {/* Processing indicator */}
      {state === "processing" && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Processing with AI...
        </div>
      )}
    </div>
  );
}
