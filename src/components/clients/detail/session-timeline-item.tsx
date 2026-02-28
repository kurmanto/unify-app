"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Appointment, SoapNote, SessionType } from "@/types";

interface SessionTimelineItemProps {
  appointment: Appointment & {
    session_type?: SessionType | null;
  };
  soapNote?: SoapNote | null;
  onClick?: () => void;
}

export function SessionTimelineItem({
  appointment,
  soapNote,
  onClick,
}: SessionTimelineItemProps) {
  const sessionType = appointment.session_type;
  const date = new Date(appointment.starts_at);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {sessionType?.name || "Session"}
              {appointment.session_number &&
                ` \u2014 #${appointment.session_number}`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {date.toLocaleDateString("en-CA", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {date.toLocaleTimeString("en-CA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {soapNote && (soapNote.subjective || soapNote.assessment) && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {soapNote.subjective || soapNote.assessment}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              `badge-${appointment.status}`
            )}
          >
            {appointment.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              `badge-${appointment.payment_status}`
            )}
          >
            {appointment.payment_status}
          </Badge>
          {soapNote && (
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  soapNote.status === "complete"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                )}
              >
                {soapNote.status === "complete" ? "Note ✓" : "Draft"}
              </Badge>
              <Link
                href={`/notes/${appointment.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Open in editor"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
