"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
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

// Active statuses that block a time slot
const ACTIVE_STATUSES = ["requested", "confirmed", "checked_in"];

// ─── Time slot helpers ──────────────────────────────────

const SLOT_INTERVAL = 15; // minutes
const DAY_START = 7 * 60; // 7:00 AM
const DAY_END = 21 * 60; // 9:00 PM

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_INTERVAL) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${suffix}`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeStr(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

function snapToSlot(time: string): string {
  const [hStr, mStr] = time.split(":");
  const totalMin = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
  const snapped = Math.round(totalMin / SLOT_INTERVAL) * SLOT_INTERVAL;
  const clamped = Math.max(DAY_START, Math.min(DAY_END - SLOT_INTERVAL, snapped));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getMinutesOfDay(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
}

/** A blocked range in minutes-of-day */
interface BlockedRange {
  startMin: number;
  endMin: number;
}

/**
 * Check if placing an appointment at `slotStartMin` with `durationMin`
 * would overlap any blocked range.
 */
function isSlotBlocked(
  slotStartMin: number,
  durationMin: number,
  blockedRanges: BlockedRange[]
): boolean {
  const slotEndMin = slotStartMin + durationMin;
  return blockedRanges.some(
    (r) => slotStartMin < r.endMin && slotEndMin > r.startMin
  );
}

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

  // Reschedule state
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const origStart = new Date(appointment.starts_at);
  const origEnd = new Date(appointment.ends_at);
  const durationMs = origEnd.getTime() - origStart.getTime();
  const durationMin = Math.round(durationMs / 60000);

  const [rescheduleDate, setRescheduleDate] = useState<Date>(origStart);
  const [rescheduleTime, setRescheduleTime] = useState(snapToSlot(toTimeStr(origStart)));

  // Blocked ranges for the selected date
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots when date changes or reschedule mode opens
  const fetchBlockedRanges = useCallback(
    async (date: Date) => {
      setLoadingSlots(true);
      const dateStr = toDateStr(date);
      const dayStart = `${dateStr}T00:00:00`;
      const dayEnd = `${dateStr}T23:59:59`;

      const [aptsResult, blocksResult] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, starts_at, ends_at, status")
          .gte("starts_at", dayStart)
          .lte("starts_at", dayEnd)
          .in("status", ACTIVE_STATUSES),
        supabase
          .from("time_blocks")
          .select("starts_at, ends_at")
          .gte("starts_at", dayStart)
          .lte("starts_at", dayEnd),
      ]);

      const ranges: BlockedRange[] = [];

      // Add appointment ranges (exclude the current appointment being rescheduled)
      if (aptsResult.data) {
        for (const apt of aptsResult.data) {
          if (apt.id === appointment.id) continue;
          ranges.push({
            startMin: getMinutesOfDay(apt.starts_at),
            endMin: getMinutesOfDay(apt.ends_at),
          });
        }
      }

      // Add time block ranges
      if (blocksResult.data) {
        for (const block of blocksResult.data) {
          ranges.push({
            startMin: getMinutesOfDay(block.starts_at),
            endMin: getMinutesOfDay(block.ends_at),
          });
        }
      }

      setBlockedRanges(ranges);
      setLoadingSlots(false);
    },
    [supabase, appointment.id]
  );

  useEffect(() => {
    if (rescheduling) {
      fetchBlockedRanges(rescheduleDate);
    }
  }, [rescheduling, rescheduleDate, fetchBlockedRanges]);

  // Auto-scroll time list to selected slot
  const timeListRef = useRef<HTMLDivElement>(null);
  const selectedTimeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (rescheduling && selectedTimeRef.current && timeListRef.current) {
      selectedTimeRef.current.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [rescheduling]);

  // If selected time becomes blocked after date change, clear it
  useEffect(() => {
    if (rescheduling && blockedRanges.length > 0) {
      const slotMin = timeToMinutes(rescheduleTime);
      if (isSlotBlocked(slotMin, durationMin, blockedRanges)) {
        setRescheduleTime("");
      }
    }
  }, [blockedRanges, rescheduling, rescheduleTime, durationMin]);

  const startTime = origStart.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = origEnd.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedSelectedDate = rescheduleDate.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const newEndTime = rescheduleTime
    ? (() => {
        const totalMin = timeToMinutes(rescheduleTime) + durationMin;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      })()
    : "";

  async function updateStatus(newStatus: AppointmentStatus) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    // Series session tracking
    if (appointment.series_id && appointment.session_number && series) {
      if (newStatus === "completed" && appointment.session_number === series.total_sessions) {
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
      } else if (newStatus === "cancelled" || newStatus === "no_show") {
        const rolledBack = Math.max(0, appointment.session_number - 1);
        const { error: seriesError } = await supabase
          .from("series")
          .update({ current_session: rolledBack })
          .eq("id", appointment.series_id);

        if (seriesError) {
          toast.error(`Appointment ${newStatus.replace("_", " ")}, but failed to update series: ` + seriesError.message);
        } else {
          toast.success(`Appointment ${newStatus.replace("_", " ")} — session ${appointment.session_number} freed up`);
          router.refresh();
          return;
        }
      }
    }

    toast.success(`Appointment ${newStatus.replace("_", " ")}`);
    router.refresh();
  }

  async function handleReschedule() {
    if (!rescheduleTime) return;
    setRescheduleLoading(true);
    const dateStr = toDateStr(rescheduleDate);
    const newStart = new Date(`${dateStr}T${rescheduleTime}`);
    const newEnd = new Date(newStart.getTime() + durationMs);

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to reschedule");
        return;
      }

      toast.success("Appointment rescheduled");
      setRescheduling(false);
      router.refresh();
    } catch {
      toast.error("Failed to reschedule");
    } finally {
      setRescheduleLoading(false);
    }
  }

  // ─── Reschedule view ─────────────────────────────────

  if (rescheduling) {
    return (
      <div className="space-y-3">
        {/* Header with back */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRescheduling(false)}
            className="p-1 -ml-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              Reschedule — {client?.first_name} {client?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionType?.name} · {durationMin} min
            </p>
          </div>
        </div>

        <Separator />

        {/* Calendar */}
        <div className="flex justify-center -mx-1">
          <Calendar
            mode="single"
            selected={rescheduleDate}
            onSelect={(date) => { if (date) setRescheduleDate(date); }}
            disabled={{ before: new Date() }}
            className="p-0"
            classNames={{
              month: "space-y-2",
              table: "w-full border-collapse",
              head_row: "flex",
              row: "flex w-full mt-1",
            }}
          />
        </div>

        {/* Selected date label */}
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {formattedSelectedDate}
          </p>
        </div>

        {/* Time slot grid */}
        <div
          ref={timeListRef}
          className="relative grid grid-cols-4 gap-1 max-h-[140px] overflow-y-auto px-0.5 py-1 rounded-lg border bg-muted/20"
        >
          {loadingSlots && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {TIME_SLOTS.map((slot) => {
            const slotMin = timeToMinutes(slot);
            const blocked = isSlotBlocked(slotMin, durationMin, blockedRanges);
            const isSelected = slot === rescheduleTime;
            return (
              <button
                key={slot}
                ref={isSelected ? selectedTimeRef : undefined}
                type="button"
                disabled={blocked}
                onClick={() => setRescheduleTime(slot)}
                className={`rounded-md px-1 py-1.5 text-[11px] font-medium transition-all ${
                  blocked
                    ? "text-muted-foreground/30 line-through cursor-not-allowed"
                    : isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {formatTime12h(slot)}
              </button>
            );
          })}
        </div>

        {/* Summary + actions */}
        <div className="space-y-2">
          {rescheduleTime ? (
            <p className="text-xs text-center text-muted-foreground">
              {formatTime12h(rescheduleTime)} — {formatTime12h(newEndTime)}
            </p>
          ) : (
            <p className="text-xs text-center text-muted-foreground italic">
              Select an available time
            </p>
          )}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
              onClick={() => setRescheduling(false)}
              disabled={rescheduleLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8"
              onClick={handleReschedule}
              disabled={rescheduleLoading || !rescheduleTime}
            >
              {rescheduleLoading ? "Saving…" : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Default view ─────────────────────────────────────

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
            <button
              type="button"
              className="flex-1 h-7 rounded-md border text-[11px] font-medium transition-colors bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900"
              onClick={() => setRescheduling(true)}
            >
              Reschedule
            </button>
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
