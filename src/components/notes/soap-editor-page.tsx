"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoapEditorHeader } from "./soap-editor-header";
import { PreSessionBriefingPanel } from "./pre-session-briefing-panel";
import { SoapSectionEditor } from "./soap-section-editor";
import { TechniqueSelector } from "./technique-selector";
import { FocusAreaSelector } from "./focus-area-selector";
import { BodyMapEditor } from "./body-map-editor";
import { SessionGoalsField } from "./session-goals-field";
import { AiScribePanel } from "./ai-scribe/ai-scribe-panel";
import { getSessionGuide } from "@/lib/rolfing/ten-series";
import type { SoapTemplate } from "@/lib/rolfing/soap-templates";
import type {
  SoapNote,
  Appointment,
  Client,
  SessionType,
  Series,
  FocusArea,
  AiSoapSuggestions,
  SoapNoteStatus,
  BodyMapDrawing,
} from "@/types";

interface SoapEditorPageProps {
  appointment: Appointment & {
    client: Client;
    session_type: SessionType;
    series?: Series | null;
  };
  existingNote: SoapNote | null;
}

interface FormData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  techniques_used: string[];
  focus_areas: FocusArea[];
  session_goals: string[];
  pre_session_notes: string;
  ai_transcript: string;
  body_map_drawings: BodyMapDrawing[];
}

export function SoapEditorPage({
  appointment,
  existingNote,
}: SoapEditorPageProps) {
  const router = useRouter();
  const [noteId, setNoteId] = useState<string | null>(existingNote?.id || null);
  const [status, setStatus] = useState<SoapNoteStatus>(
    existingNote?.status || "draft"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showAiScribe, setShowAiScribe] = useState(false);
  const [, setTick] = useState(0);

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AiSoapSuggestions | null>(
    existingNote?.ai_suggestions || null
  );
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );

  // Form state
  const [form, setForm] = useState<FormData>({
    subjective: existingNote?.subjective || "",
    objective: existingNote?.objective || "",
    assessment: existingNote?.assessment || "",
    plan: existingNote?.plan || "",
    techniques_used: existingNote?.techniques_used || [],
    focus_areas: existingNote?.focus_areas || [],
    session_goals: existingNote?.session_goals || [],
    pre_session_notes: existingNote?.pre_session_notes || "",
    ai_transcript: existingNote?.ai_transcript || "",
    body_map_drawings: existingNote?.body_map_drawings || [],
  });

  const formRef = useRef(form);
  formRef.current = form;

  const client = appointment.client;
  const sessionType = appointment.session_type;
  const sessionGuide = appointment.session_number
    ? getSessionGuide(appointment.session_number)
    : null;

  // Update form field helper
  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Create note if it doesn't exist
  useEffect(() => {
    if (!noteId) {
      fetch("/api/notes/auto-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appointment.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) setNoteId(data.id);
        })
        .catch(() => {});
    }
  }, [noteId, appointment.id]);

  // Save function
  const save = useCallback(
    async (markComplete = false) => {
      if (!noteId) return;
      setIsSaving(true);
      try {
        const payload: Record<string, unknown> = {
          ...formRef.current,
          ai_suggestions: aiSuggestions,
        };
        if (markComplete) {
          payload.status = "complete";
        }

        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setLastSavedAt(new Date());
          if (markComplete) {
            setStatus("complete");
            toast.success("SOAP note completed");
            router.refresh();
          }
        } else {
          const err = await res.json();
          toast.error("Save failed: " + (err.error || "Unknown error"));
        }
      } catch {
        toast.error("Save failed — check your connection");
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, aiSuggestions, router]
  );

  // Auto-save with 3s debounce
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!noteId || status === "complete") return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      save();
    }, 3000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, noteId, status, save]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        save();
      }
      if (mod && e.shiftKey && e.key === "C") {
        e.preventDefault();
        save(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  // Unsaved changes warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (status !== "complete") {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // Refresh "X ago" indicator every 10s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Accept AI suggestion for a section
  function acceptSuggestion(
    section: "subjective" | "objective" | "assessment" | "plan",
    text: string
  ) {
    updateField(section, text);
    setDismissedSuggestions((prev) => new Set([...prev, section]));
  }

  function dismissSuggestion(section: string) {
    setDismissedSuggestions((prev) => new Set([...prev, section]));
  }

  // Apply template
  function applyTemplate(template: SoapTemplate, overwrite: boolean) {
    if (overwrite || !form.objective) updateField("objective", template.objective);
    if (overwrite || !form.assessment) updateField("assessment", template.assessment);
    if (overwrite || form.techniques_used.length === 0)
      updateField("techniques_used", template.techniques);
    if (overwrite || form.focus_areas.length === 0)
      updateField(
        "focus_areas",
        template.focus_areas.map((a) => ({ area: a, notes: "" }))
      );
    if (overwrite || form.session_goals.length === 0)
      updateField("session_goals", template.session_goals);
    toast.success("Template applied");
  }

  // Handle AI scribe result
  function handleAiScribeResult(result: {
    transcript: string;
    structured_note: AiSoapSuggestions | null;
    audio_url?: string | null;
  }) {
    updateField("ai_transcript", result.transcript);
    if (result.structured_note) {
      setAiSuggestions(result.structured_note);
      setDismissedSuggestions(new Set());
    }
  }

  const sessionInfo = `${sessionType.name}${
    appointment.session_number
      ? ` (Session ${appointment.session_number})`
      : ""
  }`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <SoapEditorHeader
        clientName={`${client.first_name} ${client.last_name}`}
        sessionInfo={sessionInfo}
        status={status}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onSave={() => save()}
        onComplete={() => save(true)}
        appointmentId={appointment.id}
        sessionNumber={appointment.session_number}
        onApplyTemplate={applyTemplate}
      />

      {/* Pre-session briefing */}
      <PreSessionBriefingPanel appointmentId={appointment.id} />

      {/* AI Scribe toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={showAiScribe ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAiScribe(!showAiScribe)}
        >
          <Mic className="h-3.5 w-3.5 mr-1.5" />
          AI Scribe
        </Button>
        {showAiScribe && (
          <span className="text-xs text-muted-foreground">
            Record a session summary and let AI structure it
          </span>
        )}
      </div>

      {/* AI Scribe panel */}
      {showAiScribe && (
        <AiScribePanel
          appointmentId={appointment.id}
          clientId={appointment.client_id}
          sessionNumber={appointment.session_number}
          onResult={handleAiScribeResult}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main content — SOAP sections */}
        <div className="lg:col-span-2 space-y-4">
          {(["subjective", "objective", "assessment", "plan"] as const).map(
            (section) => (
              <SoapSectionEditor
                key={section}
                section={section}
                value={form[section]}
                onChange={(val) => updateField(section, val)}
                aiSuggestion={
                  aiSuggestions && !dismissedSuggestions.has(section)
                    ? aiSuggestions[section]
                    : null
                }
                onAcceptSuggestion={(text) => acceptSuggestion(section, text)}
                onDismissSuggestion={() => dismissSuggestion(section)}
              />
            )
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Techniques */}
          <div className="rounded-lg border bg-card p-4">
            <TechniqueSelector
              selected={form.techniques_used}
              onChange={(val) => updateField("techniques_used", val)}
            />

            {/* AI suggested techniques */}
            {aiSuggestions &&
              aiSuggestions.techniques.length > 0 &&
              !dismissedSuggestions.has("techniques") && (
                <div className="mt-3 rounded-md bg-primary/5 border border-primary/10 p-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
                    <Sparkles className="h-3 w-3" />
                    Suggested
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestions.techniques
                      .filter((t) => !form.techniques_used.includes(t))
                      .map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() =>
                            updateField("techniques_used", [
                              ...form.techniques_used,
                              tech,
                            ])
                          }
                          className="text-[10px] border rounded-full px-2 py-0.5 hover:bg-primary/10 transition-colors"
                        >
                          + {tech}
                        </button>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Body map + Focus areas */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <BodyMapEditor
              focusAreas={form.focus_areas}
              onToggleRegion={(region) => {
                const exists = form.focus_areas.some((fa) => fa.area === region);
                if (exists) {
                  updateField(
                    "focus_areas",
                    form.focus_areas.filter((fa) => fa.area !== region)
                  );
                } else {
                  updateField("focus_areas", [
                    ...form.focus_areas,
                    { area: region, notes: "" },
                  ]);
                }
              }}
              drawings={form.body_map_drawings}
              onDrawingsChange={(val) => updateField("body_map_drawings", val)}
            />
            <FocusAreaSelector
              selected={form.focus_areas}
              onChange={(val) => updateField("focus_areas", val)}
            />
          </div>

          {/* Session goals */}
          <div className="rounded-lg border bg-card p-4">
            <SessionGoalsField
              goals={form.session_goals}
              onChange={(val) => updateField("session_goals", val)}
            />
          </div>

          {/* Ten Series guide */}
          {sessionGuide && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  Session {sessionGuide.session}: {sessionGuide.name}
                </h3>
              </div>

              <div>
                <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                  Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {sessionGuide.focus_areas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                  Techniques
                </h4>
                <div className="flex flex-wrap gap-1">
                  {sessionGuide.techniques.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                  Goals
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {sessionGuide.goals.map((goal) => (
                    <li key={goal}>• {goal}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground">
                {sessionGuide.philosophy}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
