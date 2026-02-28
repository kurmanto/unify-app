"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { SessionCompareCard } from "./session-compare-card";
import { cn } from "@/lib/utils";
import type { SoapNote, Appointment, Client, SessionType } from "@/types";

interface ComparisonSummary {
  progress_patterns: string[];
  recurring_issues: string[];
  technique_evolution: string[];
  recommended_focus: string[];
}

interface ComparePageClientProps {
  client: Client;
  appointments: (Appointment & { session_type?: SessionType | null })[];
  soapNotes: SoapNote[];
}

export function ComparePageClient({
  client,
  appointments,
  soapNotes,
}: ComparePageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);

  // Only show completed appointments with SOAP notes
  const completedWithNotes = appointments
    .filter((apt) => {
      const note = soapNotes.find((n) => n.appointment_id === apt.id);
      return apt.status === "completed" && note;
    })
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );

  function toggleSelection(appointmentId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(appointmentId)) {
        next.delete(appointmentId);
      } else if (next.size < 3) {
        next.add(appointmentId);
      }
      return next;
    });
    setSummary(null);
  }

  const selectedAppointments = completedWithNotes.filter((apt) =>
    selectedIds.has(apt.id)
  );

  async function generateSummary() {
    const noteIds = selectedAppointments.map((apt) => {
      const note = soapNotes.find((n) => n.appointment_id === apt.id)!;
      return note.id;
    });

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/compare-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_ids: noteIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch {
      // Silently fail
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href={`/clients/${client.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight font-heading">
            Compare Sessions
          </h1>
          <p className="text-sm text-muted-foreground">
            {client.first_name} {client.last_name} — select 2–3 sessions
          </p>
        </div>
      </div>

      {/* Session selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Select Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {completedWithNotes.map((apt) => {
              const date = new Date(apt.starts_at);
              const selected = selectedIds.has(apt.id);
              return (
                <button
                  key={apt.id}
                  onClick={() => toggleSelection(apt.id)}
                  className={cn(
                    "shrink-0 rounded-lg border p-3 text-left transition-all min-w-[140px]",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-accent/50"
                  )}
                >
                  <p className="text-xs font-medium">
                    {apt.session_type?.name || "Session"}
                    {apt.session_number && ` #${apt.session_number}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {date.toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </button>
              );
            })}
          </div>
          {completedWithNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No completed sessions with SOAP notes found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison grid */}
      {selectedAppointments.length >= 2 && (
        <div
          className={cn(
            "grid gap-4",
            selectedAppointments.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          )}
        >
          {selectedAppointments.map((apt) => {
            const note = soapNotes.find((n) => n.appointment_id === apt.id)!;
            return (
              <Card key={apt.id}>
                <CardContent className="pt-4">
                  <SessionCompareCard appointment={apt} soapNote={note} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Summary */}
      {selectedAppointments.length >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  AI Comparison Summary
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {!summary && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={generateSummary}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
                {summary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSummaryOpen(!summaryOpen)}
                  >
                    {summaryOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {summary && summaryOpen && (
            <CardContent className="space-y-3">
              <SummarySection
                title="Progress Patterns"
                items={summary.progress_patterns}
              />
              <SummarySection
                title="Recurring Issues"
                items={summary.recurring_issues}
              />
              <SummarySection
                title="Technique Evolution"
                items={summary.technique_evolution}
              />
              <SummarySection
                title="Recommended Next Focus"
                items={summary.recommended_focus}
              />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

function SummarySection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
