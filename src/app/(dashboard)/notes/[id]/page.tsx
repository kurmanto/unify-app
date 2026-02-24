"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Mic, MicOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getSessionGuide } from "@/lib/rolfing/ten-series";
import Link from "next/link";

interface SoapNoteData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  focus_areas: string;
  techniques_used: string;
  session_goals: string;
  pre_session_notes: string;
}

export default function SoapNotePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingNoteId, setExistingNoteId] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Record<string, unknown> | null>(null);
  const [note, setNote] = useState<SoapNoteData>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    focus_areas: "",
    techniques_used: "",
    session_goals: "",
    pre_session_notes: "",
  });
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  async function loadData() {
    // Load appointment details
    const { data: apt } = await supabase
      .from("appointments")
      .select("*, client:clients(*), session_type:session_types(*)")
      .eq("id", appointmentId)
      .single();

    if (apt) {
      setAppointment(apt);
    }

    // Load existing SOAP note if any
    const { data: existingNote } = await supabase
      .from("soap_notes")
      .select("*")
      .eq("appointment_id", appointmentId)
      .single();

    if (existingNote) {
      setExistingNoteId(existingNote.id);
      setNote({
        subjective: existingNote.subjective || "",
        objective: existingNote.objective || "",
        assessment: existingNote.assessment || "",
        plan: existingNote.plan || "",
        focus_areas: existingNote.focus_areas
          ? JSON.stringify(existingNote.focus_areas)
          : "",
        techniques_used: existingNote.techniques_used
          ? (existingNote.techniques_used as string[]).join(", ")
          : "",
        session_goals: existingNote.session_goals
          ? (existingNote.session_goals as string[]).join(", ")
          : "",
        pre_session_notes: existingNote.pre_session_notes || "",
      });
    }

    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const payload = {
      appointment_id: appointmentId,
      practitioner_id: user.id,
      subjective: note.subjective || null,
      objective: note.objective || null,
      assessment: note.assessment || null,
      plan: note.plan || null,
      techniques_used: note.techniques_used
        ? note.techniques_used.split(",").map((t) => t.trim())
        : null,
      session_goals: note.session_goals
        ? note.session_goals.split(",").map((g) => g.trim())
        : null,
      pre_session_notes: note.pre_session_notes || null,
    };

    let error;
    if (existingNoteId) {
      ({ error } = await supabase
        .from("soap_notes")
        .update(payload)
        .eq("id", existingNoteId));
    } else {
      ({ error } = await supabase.from("soap_notes").insert(payload));
    }

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("SOAP note saved");
      router.push(`/appointments/${appointmentId}`);
    }
    setSaving(false);
  }

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      toast.info("Recording stopped. Transcription requires Deepgram API key.");
    } else {
      setIsRecording(true);
      toast.info("Recording started. Configure Deepgram API for live transcription.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const client = appointment?.client as Record<string, string> | null;
  const sessionType = appointment?.session_type as Record<string, unknown> | null;
  const sessionGuide = appointment?.session_number
    ? getSessionGuide(appointment.session_number as number)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/appointments/${appointmentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight font-heading">SOAP Note</h1>
          <p className="text-muted-foreground">
            {client?.first_name} {client?.last_name} —{" "}
            {sessionType?.name as string}
            {appointment?.session_number
              ? ` (Session ${appointment.session_number as number})`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={toggleRecording}
          >
            {isRecording ? (
              <MicOff className="mr-2 h-4 w-4" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {isRecording ? "Stop Recording" : "Voice Dictation"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* SOAP Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Subjective</CardTitle>
              <CardDescription>
                Client&apos;s reported symptoms, concerns, and experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.subjective}
                onChange={(e) =>
                  setNote((prev) => ({ ...prev, subjective: e.target.value }))
                }
                rows={4}
                placeholder="What the client reported..."
                className="input-premium"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objective</CardTitle>
              <CardDescription>
                Your observations, findings, and measurements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.objective}
                onChange={(e) =>
                  setNote((prev) => ({ ...prev, objective: e.target.value }))
                }
                rows={4}
                placeholder="What you observed..."
                className="input-premium"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
              <CardDescription>
                Clinical assessment and interpretation of findings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.assessment}
                onChange={(e) =>
                  setNote((prev) => ({ ...prev, assessment: e.target.value }))
                }
                rows={4}
                placeholder="Your assessment..."
                className="input-premium"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
              <CardDescription>
                Treatment plan and follow-up recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.plan}
                onChange={(e) =>
                  setNote((prev) => ({ ...prev, plan: e.target.value }))
                }
                rows={4}
                placeholder="Plan for next session..."
                className="input-premium"
              />
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Techniques Used (comma-separated)</Label>
                <Input
                  value={note.techniques_used}
                  onChange={(e) =>
                    setNote((prev) => ({
                      ...prev,
                      techniques_used: e.target.value,
                    }))
                  }
                  placeholder="Myofascial release, deep tissue, cranial..."
                  className="input-premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Session Goals (comma-separated)</Label>
                <Input
                  value={note.session_goals}
                  onChange={(e) =>
                    setNote((prev) => ({
                      ...prev,
                      session_goals: e.target.value,
                    }))
                  }
                  placeholder="Open ribcage, improve breathing, address shoulder..."
                  className="input-premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Pre-Session Notes</Label>
                <Textarea
                  value={note.pre_session_notes}
                  onChange={(e) =>
                    setNote((prev) => ({
                      ...prev,
                      pre_session_notes: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Notes before the session..."
                  className="input-premium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Session Guide */}
        <div className="space-y-6">
          {sessionGuide && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Session {sessionGuide.session} Guide
                </CardTitle>
                <CardDescription>{sessionGuide.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
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
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Suggested Techniques
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
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Goals
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {sessionGuide.goals.map((goal) => (
                      <li key={goal}>• {goal}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Philosophy
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {sessionGuide.philosophy}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
