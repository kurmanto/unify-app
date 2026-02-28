"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompareArrows } from "lucide-react";
import { SessionTimelineItem } from "./session-timeline-item";
import type { Appointment, SoapNote, SessionType } from "@/types";

interface SessionTimelineProps {
  clientId: string;
  appointments: (Appointment & { session_type?: SessionType | null })[];
  soapNotes: SoapNote[];
  onSessionClick?: (appointmentId: string) => void;
  filterRegion?: string | null;
}

export function SessionTimeline({
  clientId,
  appointments,
  soapNotes,
  onSessionClick,
  filterRegion,
}: SessionTimelineProps) {
  // Count completed sessions with SOAP notes for compare button
  const completedWithNotes = appointments.filter((apt) => {
    const note = soapNotes.find((n) => n.appointment_id === apt.id);
    return apt.status === "completed" && note;
  });

  // Sort most recent first
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  );

  // Filter by body region if set
  const filtered = filterRegion
    ? sorted.filter((apt) => {
        const note = soapNotes.find((n) => n.appointment_id === apt.id);
        if (!note?.focus_areas) return false;
        return note.focus_areas.some(
          (fa) => fa.area.toLowerCase().includes(filterRegion.toLowerCase())
        );
      })
    : sorted;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading">Sessions</CardTitle>
          <div className="flex items-center gap-2">
            {completedWithNotes.length >= 2 && (
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link href={`/clients/${clientId}/compare`}>
                  <GitCompareArrows className="h-3 w-3 mr-1" />
                  Compare
                </Link>
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {filtered.length} session{filtered.length !== 1 ? "s" : ""}
              {filterRegion && ` (filtered: ${filterRegion})`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {appointments.length === 0
              ? "No sessions yet \u2014 schedule the first one."
              : "No sessions match this filter."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((apt) => {
              const soapNote = soapNotes.find(
                (n) => n.appointment_id === apt.id
              );
              return (
                <SessionTimelineItem
                  key={apt.id}
                  appointment={apt}
                  soapNote={soapNote}
                  onClick={() => onSessionClick?.(apt.id)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
