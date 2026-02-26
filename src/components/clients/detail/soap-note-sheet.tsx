"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Pencil, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { SoapNote, Appointment, SessionType } from "@/types";

interface SoapNoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soapNote: SoapNote | null;
  appointment: (Appointment & { session_type?: SessionType | null }) | null;
  onSoapNoteUpdate?: (updated: SoapNote) => void;
}

export function SoapNoteSheet({
  open,
  onOpenChange,
  soapNote,
  appointment,
  onSoapNoteUpdate,
}: SoapNoteSheetProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subjective: soapNote?.subjective || "",
    objective: soapNote?.objective || "",
    assessment: soapNote?.assessment || "",
    plan: soapNote?.plan || "",
  });

  // Reset form when opening with new data
  function handleOpenChange(open: boolean) {
    if (open && soapNote) {
      setForm({
        subjective: soapNote.subjective || "",
        objective: soapNote.objective || "",
        assessment: soapNote.assessment || "",
        plan: soapNote.plan || "",
      });
      setEditing(false);
    }
    onOpenChange(open);
  }

  async function handleSave() {
    if (!soapNote) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("soap_notes")
      .update(form)
      .eq("id", soapNote.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("SOAP note saved");
      onSoapNoteUpdate?.(data);
      setEditing(false);
    }
    setSaving(false);
  }

  const sessionDate = appointment
    ? new Date(appointment.starts_at).toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg"
        showCloseButton={true}
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="font-heading">
            {appointment?.session_type?.name || "SOAP Note"}
            {appointment?.session_number && ` — #${appointment.session_number}`}
          </SheetTitle>
          <SheetDescription>{sessionDate}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-4 px-4">
          {!soapNote ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No SOAP note for this session.</p>
              <p className="text-sm mt-1">
                Create one from the notes editor.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Edit toggle */}
              <div className="flex justify-end">
                {editing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />{" "}
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                )}
              </div>

              {/* SOAP sections */}
              {(
                [
                  { key: "subjective", label: "Subjective", color: "text-blue-600" },
                  { key: "objective", label: "Objective", color: "text-emerald-600" },
                  { key: "assessment", label: "Assessment", color: "text-amber-600" },
                  { key: "plan", label: "Plan", color: "text-purple-600" },
                ] as const
              ).map(({ key, label, color }) => (
                <div key={key} className="space-y-1.5">
                  <h3 className={`text-sm font-semibold ${color}`}>
                    {label}
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      rows={4}
                      className="input-premium text-sm"
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {soapNote[key] || (
                        <span className="text-muted-foreground italic">
                          Not recorded
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ))}

              <Separator />

              {/* Techniques */}
              {soapNote.techniques_used &&
                soapNote.techniques_used.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold">Techniques Used</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {soapNote.techniques_used.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Focus areas */}
              {soapNote.focus_areas && soapNote.focus_areas.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold">Focus Areas</h3>
                  <div className="space-y-1">
                    {soapNote.focus_areas.map((fa, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{fa.area}</span>
                        {fa.notes && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {fa.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session goals */}
              {soapNote.session_goals && soapNote.session_goals.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold">Session Goals</h3>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {soapNote.session_goals.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI transcript */}
              {soapNote.ai_transcript && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold">Voice Transcript</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-secondary/50 rounded-lg p-3">
                    {soapNote.ai_transcript}
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
