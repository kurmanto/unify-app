"use client";

import { Badge } from "@/components/ui/badge";
import type { SoapNote, Appointment, SessionType } from "@/types";

interface SessionCompareCardProps {
  appointment: Appointment & { session_type?: SessionType | null };
  soapNote: SoapNote;
}

export function SessionCompareCard({
  appointment,
  soapNote,
}: SessionCompareCardProps) {
  const date = new Date(appointment.starts_at);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold">
          {appointment.session_type?.name || "Session"}
          {appointment.session_number && ` #${appointment.session_number}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Subjective */}
      <div>
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
          Subjective
        </p>
        <p className="text-xs whitespace-pre-wrap">
          {soapNote.subjective || <span className="italic text-muted-foreground">Not recorded</span>}
        </p>
      </div>

      {/* Objective */}
      <div>
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
          Objective
        </p>
        <p className="text-xs whitespace-pre-wrap">
          {soapNote.objective || <span className="italic text-muted-foreground">Not recorded</span>}
        </p>
      </div>

      {/* Techniques */}
      {soapNote.techniques_used && soapNote.techniques_used.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
            Techniques
          </p>
          <div className="flex flex-wrap gap-1">
            {soapNote.techniques_used.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {soapNote.focus_areas && soapNote.focus_areas.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
            Focus Areas
          </p>
          <div className="flex flex-wrap gap-1">
            {soapNote.focus_areas.map((fa) => (
              <Badge key={fa.area} variant="secondary" className="text-[10px]">
                {fa.area.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Assessment */}
      <div>
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
          Assessment
        </p>
        <p className="text-xs whitespace-pre-wrap">
          {soapNote.assessment || <span className="italic text-muted-foreground">Not recorded</span>}
        </p>
      </div>

      {/* Plan */}
      <div>
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
          Plan
        </p>
        <p className="text-xs whitespace-pre-wrap">
          {soapNote.plan || <span className="italic text-muted-foreground">Not recorded</span>}
        </p>
      </div>
    </div>
  );
}
