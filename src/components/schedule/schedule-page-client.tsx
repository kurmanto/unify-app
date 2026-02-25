"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Ban } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import { TimeBlockDialog } from "@/components/schedule/time-block-dialog";
import { ScheduleToolbar } from "@/components/schedule/schedule-toolbar";
import { CalendarWeekView } from "@/components/schedule/calendar-week-view";
import { CalendarDayView } from "@/components/schedule/calendar-day-view";
import { CalendarMonthView } from "@/components/schedule/calendar-month-view";
import { AppointmentListView } from "@/components/schedule/appointment-list-view";
import type {
  TimeBlock,
  CalendarSlotClickData,
  DragSelectData,
  ScheduleView,
  CalendarAppointment,
  AppointmentDropData,
} from "@/types";

interface ListAppointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_status: string | null;
  client_id: string;
  session_number: number | null;
  client: { first_name: string; last_name: string } | null;
  session_type: { name: string } | null;
}

interface SchedulePageClientProps {
  view: ScheduleView;
  calendarAppointments: CalendarAppointment[];
  listAppointments: ListAppointment[];
  timeBlocks: TimeBlock[];
  initialStatus: string;
  rangeStart: string;
  rangeEnd: string;
  prevDate: string;
  nextDate: string;
  dateLabel: string;
  currentDate: string;
}

export function SchedulePageClient({
  view,
  calendarAppointments,
  listAppointments,
  timeBlocks,
  initialStatus,
  rangeStart,
  rangeEnd,
  prevDate,
  nextDate,
  dateLabel,
  currentDate,
}: SchedulePageClientProps) {
  const router = useRouter();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [timeBlockDialogOpen, setTimeBlockDialogOpen] = useState(false);
  const [slotData, setSlotData] = useState<CalendarSlotClickData | null>(null);
  const [dragData, setDragData] = useState<DragSelectData | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | undefined>(
    undefined
  );
  const [showWeekends, setShowWeekends] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<AppointmentDropData | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Sync from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem("schedule-show-sunday");
    if (stored === "true") setShowWeekends(true);
  }, []);

  function handleToggleWeekends() {
    setShowWeekends((prev) => {
      const next = !prev;
      localStorage.setItem("schedule-show-sunday", String(next));
      return next;
    });
  }

  function handleSlotClick(data: CalendarSlotClickData) {
    setSlotData(data);
    setDragData(null);
    setAppointmentDialogOpen(true);
  }

  function handleDragSelect(data: DragSelectData) {
    setDragData(data);
    setSlotData({ date: data.date, time: data.startTime });
    setTimeBlockDialogOpen(true);
  }

  function handleTimeBlockClick(block: TimeBlock) {
    setEditingBlock(block);
    setTimeBlockDialogOpen(true);
  }

  function handleNewAppointment() {
    setSlotData(null);
    setDragData(null);
    setAppointmentDialogOpen(true);
  }

  function handleBlockTime() {
    setEditingBlock(undefined);
    setDragData(null);
    setTimeBlockDialogOpen(true);
  }

  function handleAppointmentDialogChange(open: boolean) {
    setAppointmentDialogOpen(open);
    if (!open) {
      setSlotData(null);
      setDragData(null);
    }
  }

  function handleTimeBlockDialogChange(open: boolean) {
    setTimeBlockDialogOpen(open);
    if (!open) {
      setEditingBlock(undefined);
      setDragData(null);
    }
  }

  function handleAppointmentDrop(data: AppointmentDropData) {
    setPendingDrop(data);
  }

  async function confirmReschedule() {
    if (!pendingDrop) return;
    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/appointments/${pendingDrop.appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starts_at: pendingDrop.newStartsAt,
          ends_at: pendingDrop.newEndsAt,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to reschedule");
        return;
      }
      toast.success("Appointment rescheduled");
      router.refresh();
    } catch {
      toast.error("Failed to reschedule");
    } finally {
      setIsRescheduling(false);
      setPendingDrop(null);
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas or when dialogs are open
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        appointmentDialogOpen ||
        timeBlockDialogOpen
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "d":
          router.push(`/schedule?view=day&date=${currentDate}`);
          break;
        case "w":
          router.push(`/schedule?view=week&date=${currentDate}`);
          break;
        case "m":
          router.push(`/schedule?view=month&date=${currentDate}`);
          break;
        case "l":
          router.push(`/schedule?view=list`);
          break;
        case "t":
          router.push(`/schedule?view=${view}`);
          break;
        case "arrowleft":
          if (prevDate) router.push(`/schedule?view=${view}&date=${prevDate}`);
          break;
        case "arrowright":
          if (nextDate) router.push(`/schedule?view=${view}&date=${nextDate}`);
          break;
      }
    },
    [router, view, currentDate, prevDate, nextDate, appointmentDialogOpen, timeBlockDialogOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            Schedule
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your calendar, appointments, and availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBlockTime}>
            <Ban className="mr-2 h-4 w-4" />
            Block Time
          </Button>
          <Button size="sm" onClick={handleNewAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <ScheduleToolbar
          currentView={view}
          dateLabel={dateLabel}
          prevDate={prevDate}
          nextDate={nextDate}
          currentDate={currentDate}
          showWeekends={showWeekends}
          onToggleWeekends={handleToggleWeekends}
        />
      </div>

      {/* View content — fills remaining space */}
      <div className="flex-1 min-h-0">
      {view === "week" && (
        <CalendarWeekView
          appointments={calendarAppointments}
          timeBlocks={timeBlocks}
          rangeStart={rangeStart}
          showWeekends={showWeekends}
          onSlotClick={handleSlotClick}
          onTimeBlockClick={handleTimeBlockClick}
          onDragSelect={handleDragSelect}
          onAppointmentDrop={handleAppointmentDrop}
        />
      )}
      {view === "day" && (
        <CalendarDayView
          appointments={calendarAppointments}
          timeBlocks={timeBlocks}
          currentDate={currentDate}
          onSlotClick={handleSlotClick}
          onTimeBlockClick={handleTimeBlockClick}
          onDragSelect={handleDragSelect}
          onAppointmentDrop={handleAppointmentDrop}
        />
      )}
      {view === "month" && (
        <CalendarMonthView
          appointments={calendarAppointments}
          currentDate={currentDate}
        />
      )}
      {view === "list" && (
        <AppointmentListView
          appointments={listAppointments}
          initialStatus={initialStatus}
        />
      )}
      </div>

      {/* Dialogs */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={handleAppointmentDialogChange}
        defaultDate={slotData?.date}
        defaultTime={slotData?.time}
      />

      <TimeBlockDialog
        open={timeBlockDialogOpen}
        onOpenChange={handleTimeBlockDialogChange}
        defaultDate={dragData?.date || slotData?.date}
        defaultTime={dragData?.startTime || slotData?.time}
        defaultEndTime={dragData?.endTime}
        editingBlock={editingBlock}
      />

      {/* Reschedule confirmation dialog */}
      <AlertDialog open={!!pendingDrop} onOpenChange={(open) => { if (!open) setPendingDrop(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                if (!pendingDrop) return null;
                const apt = calendarAppointments.find((a) => a.id === pendingDrop.appointmentId);
                if (!apt) return "Move this appointment to the new time?";
                const clientName = apt.client
                  ? `${apt.client.first_name} ${apt.client.last_name}`
                  : "Unknown client";
                const sessionName = apt.session_type?.name || "Appointment";
                const newStart = new Date(pendingDrop.newStartsAt);
                const newEnd = new Date(pendingDrop.newEndsAt);
                const oldStart = new Date(apt.starts_at);
                const fmtTime = (d: Date) =>
                  d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
                const dayChanged = newStart.toDateString() !== oldStart.toDateString();
                const datePart = dayChanged
                  ? newStart.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }) + " "
                  : "";
                return `${clientName} — ${sessionName} → ${datePart}${fmtTime(newStart)} – ${fmtTime(newEnd)}`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRescheduling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReschedule} disabled={isRescheduling}>
              {isRescheduling ? "Rescheduling…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
