"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { CalendarAppointment, AppointmentStatus } from "@/types";

// ─── Shared style maps ─────────────────────────────────

export const statusBorderColor: Record<string, string> = {
  requested: "border-l-amber-500",
  confirmed: "border-l-teal-500",
  checked_in: "border-l-blue-500",
  completed: "border-l-green-500",
  cancelled: "border-l-gray-400",
  no_show: "border-l-red-500",
};

export const statusBadgeClass: Record<string, string> = {
  requested: "badge-requested",
  confirmed: "badge-confirmed",
  checked_in: "badge-checked_in",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  no_show: "badge-no_show",
};

// ─── Status transitions (mirrors appointment-actions.tsx) ─

interface Transition {
  label: string;
  next: AppointmentStatus;
  className: string;
}

const statusTransitions: Record<string, Transition[]> = {
  requested: [
    { label: "Confirm", next: "confirmed", className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900" },
    { label: "Cancel", next: "cancelled", className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900" },
  ],
  confirmed: [
    { label: "Check In", next: "checked_in", className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900" },
    { label: "Cancel", next: "cancelled", className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900" },
    { label: "No Show", next: "no_show", className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900" },
  ],
  checked_in: [
    { label: "Complete", next: "completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900" },
  ],
  completed: [],
  cancelled: [],
  no_show: [],
};

// Statuses that can be rescheduled
const reschedulableStatuses = new Set(["requested", "confirmed"]);

// ─── Component ──────────────────────────────────────────

interface AppointmentPopoverContentProps {
  appointment: CalendarAppointment;
}

export function AppointmentPopoverContent({ appointment }: AppointmentPopoverContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const client = appointment.client;
  const sessionType = appointment.session_type;
  const series = appointment.series;
  const transitions = statusTransitions[appointment.status] || [];

  const startTime = new Date(appointment.starts_at).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(appointment.ends_at).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function updateStatus(newStatus: AppointmentStatus) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    // Complete the series when session 10 is marked completed
    if (newStatus === "completed" && appointment.series_id && appointment.session_number === 10) {
      const { error: seriesError } = await supabase
        .from("series")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", appointment.series_id);

      if (seriesError) {
        toast.error("Appointment completed, but failed to complete series: " + seriesError.message);
      } else {
        toast.success("Appointment completed — Ten Series finished!");
        router.refresh();
        return;
      }
    }

    toast.success(`Appointment ${newStatus.replace("_", " ")}`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <p className="font-semibold text-sm">
          {client?.first_name} {client?.last_name}
        </p>
        <p className="text-sm text-muted-foreground">
          {sessionType?.name}
          {sessionType?.duration_minutes && ` — ${sessionType.duration_minutes} min`}
        </p>
        <p className="text-sm text-muted-foreground">
          {startTime} — {endTime}
        </p>
      </div>

      {/* Info row: status + series progress */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={statusBadgeClass[appointment.status] || ""}
        >
          {appointment.status.replace("_", " ")}
        </Badge>
        {series && appointment.session_number && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Session {appointment.session_number} of {series.total_sessions}
          </span>
        )}
      </div>

      <Separator />

      {/* Status actions — single row */}
      {(transitions.length > 0 || reschedulableStatuses.has(appointment.status)) && (
        <div className="flex gap-1.5">
          {transitions.map((t) => (
            <button
              key={t.next}
              type="button"
              className={`flex-1 h-7 rounded-md border text-[11px] font-medium transition-colors ${t.className}`}
              onClick={() => updateStatus(t.next)}
            >
              {t.label}
            </button>
          ))}
          {reschedulableStatuses.has(appointment.status) && (
            <Link
              href={`/appointments/${appointment.id}`}
              className="flex-1 h-7 rounded-md border text-[11px] font-medium transition-colors flex items-center justify-center bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900"
            >
              Reschedule
            </Link>
          )}
        </div>
      )}

      {/* Secondary links */}
      <div className="flex gap-1.5">
        {client?.email && (
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" asChild>
            <a href={`mailto:${client.email}`}>Email</a>
          </Button>
        )}
        {client?.phone && (
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" asChild>
            <a href={`tel:${client.phone}`}>Call</a>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" asChild>
          <Link href={`/appointments/${appointment.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}
