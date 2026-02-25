"use client";

import { useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDayColumn,
  isAllDayBlock,
  START_HOUR,
  TOTAL_HOURS,
  MIN_HOUR_HEIGHT,
  SLOT_MINUTES,
} from "@/components/schedule/calendar-day-column";
import type {
  TimeBlock,
  CalendarSlotClickData,
  DragSelectData,
  CalendarAppointment,
  AppointmentDropData,
  AppointmentDragGhost,
} from "@/types";

const DRAG_THRESHOLD_PX = 5;
const DRAGGABLE_STATUSES = ["requested", "confirmed", "checked_in"];
const END_HOUR = START_HOUR + TOTAL_HOURS;

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function getMinutesOfDay(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
}

const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

interface CalendarDayViewProps {
  appointments: CalendarAppointment[];
  timeBlocks: TimeBlock[];
  currentDate: string;
  onSlotClick: (data: CalendarSlotClickData) => void;
  onTimeBlockClick: (block: TimeBlock) => void;
  onDragSelect: (data: DragSelectData) => void;
  onAppointmentDrop?: (data: AppointmentDropData) => void;
}

export function CalendarDayView({
  appointments,
  timeBlocks,
  currentDate,
  onSlotClick,
  onTimeBlockClick,
  onDragSelect,
  onAppointmentDrop,
}: CalendarDayViewProps) {
  const date = new Date(currentDate + "T12:00:00");
  const gridRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  // Appointment drag state
  const aptDragRef = useRef<{
    appointmentId: string;
    startY: number;
    originalStartMin: number;
    originalEndMin: number;
    durationMin: number;
    grabOffsetMin: number;
    captured: boolean;
  } | null>(null);
  const [aptDragVisual, setAptDragVisual] = useState<{
    appointmentId: string;
    startMinutes: number;
    endMinutes: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const getMinutesFromY = useCallback((clientY: number): number => {
    const el = columnRef.current;
    if (!el) return START_HOUR * 60;
    const rect = el.getBoundingClientRect();
    const relY = clientY - rect.top;
    const raw = START_HOUR * 60 + (relY / rect.height) * TOTAL_HOURS * 60;
    const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;
    return Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, snapped));
  }, []);

  const handleGridPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const aptBlock = target.closest("[data-appointment-block]") as HTMLElement | null;
      if (!aptBlock) return;

      const aptId = aptBlock.getAttribute("data-appointment-id");
      const aptStatus = aptBlock.getAttribute("data-appointment-status");
      if (!aptId || !aptStatus || !DRAGGABLE_STATUSES.includes(aptStatus)) return;

      const apt = appointments.find((a) => a.id === aptId);
      if (!apt) return;

      const originalStartMin = getMinutesOfDay(apt.starts_at);
      const originalEndMin = getMinutesOfDay(apt.ends_at);
      const grabMin = getMinutesFromY(e.clientY);

      aptDragRef.current = {
        appointmentId: aptId,
        startY: e.clientY,
        originalStartMin,
        originalEndMin,
        durationMin: originalEndMin - originalStartMin,
        grabOffsetMin: grabMin - originalStartMin,
        captured: false,
      };
    },
    [appointments, getMinutesFromY]
  );

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!aptDragRef.current) return;

      const dy = Math.abs(e.clientY - aptDragRef.current.startY);
      if (!aptDragRef.current.captured && dy < DRAG_THRESHOLD_PX) return;

      if (!aptDragRef.current.captured) {
        aptDragRef.current.captured = true;
        gridRef.current?.setPointerCapture(e.pointerId);
      }

      const pointerMin = getMinutesFromY(e.clientY);
      const newStartMin = pointerMin - aptDragRef.current.grabOffsetMin;
      const dur = aptDragRef.current.durationMin;
      const clampedStart = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60 - dur, newStartMin));
      const snappedStart = Math.round(clampedStart / SLOT_MINUTES) * SLOT_MINUTES;

      setAptDragVisual({
        appointmentId: aptDragRef.current.appointmentId,
        startMinutes: snappedStart,
        endMinutes: snappedStart + dur,
      });
    },
    [getMinutesFromY]
  );

  const handleGridPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!aptDragRef.current) return;

      const drag = aptDragRef.current;
      aptDragRef.current = null;

      if (!drag.captured) {
        setAptDragVisual(null);
        return;
      }

      gridRef.current?.releasePointerCapture(e.pointerId);

      if (aptDragVisual && onAppointmentDrop) {
        if (aptDragVisual.startMinutes !== drag.originalStartMin) {
          const startDate = new Date(date);
          startDate.setHours(Math.floor(aptDragVisual.startMinutes / 60), aptDragVisual.startMinutes % 60, 0, 0);
          const endDate = new Date(date);
          endDate.setHours(Math.floor(aptDragVisual.endMinutes / 60), aptDragVisual.endMinutes % 60, 0, 0);

          onAppointmentDrop({
            appointmentId: drag.appointmentId,
            newStartsAt: startDate.toISOString(),
            newEndsAt: endDate.toISOString(),
          });
        }
      }

      suppressClickRef.current = true;
      setAptDragVisual(null);
    },
    [date, aptDragVisual, onAppointmentDrop]
  );

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // Build ghost
  const dragGhost: AppointmentDragGhost | undefined = (() => {
    if (!aptDragVisual) return undefined;
    const apt = appointments.find((a) => a.id === aptDragVisual.appointmentId);
    if (!apt) return undefined;
    return {
      appointment: apt,
      startMinutes: aptDragVisual.startMinutes,
      endMinutes: aptDragVisual.endMinutes,
    };
  })();

  const allDayBlocks = timeBlocks.filter((block) => {
    const blockDate = new Date(block.starts_at);
    return (
      blockDate.getDate() === date.getDate() &&
      blockDate.getMonth() === date.getMonth() &&
      blockDate.getFullYear() === date.getFullYear() &&
      isAllDayBlock(block)
    );
  });

  const hasAllDay = allDayBlocks.length > 0;
  const allDayRow = hasAllDay ? 1 : null;
  const hourRowStart = hasAllDay ? 2 : 1;
  const hourRowEnd = hourRowStart + TOTAL_HOURS;

  const rowTemplate = [
    ...(hasAllDay ? ["auto"] : []),
    `repeat(${TOTAL_HOURS}, minmax(${MIN_HOUR_HEIGHT}px, 1fr))`,
  ].join(" ");

  return (
    <Card className={`flex flex-col overflow-hidden h-full py-0 gap-0 rounded-xl ${hasAllDay ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
      <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
        <div
          ref={gridRef}
          className="grid"
          style={{
            gridTemplateColumns: "3.5rem 1fr",
            gridTemplateRows: rowTemplate,
          }}
          onPointerDown={handleGridPointerDown}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onClickCapture={handleClickCapture}
        >
          {/* ── ALL-DAY ROW (conditional) ── */}
          {allDayRow && (
            <>
              <div
                className="sticky top-0 z-30 bg-red-50 dark:bg-red-950/20 border-r border-b flex items-center justify-end pr-2"
                style={{ gridColumn: 1, gridRow: allDayRow }}
              >
                <span className="text-[10px] text-muted-foreground">
                  ALL DAY
                </span>
              </div>
              <div
                className="sticky top-0 z-30 bg-red-50 dark:bg-red-950/20 border-b px-1 py-1 flex flex-wrap gap-1"
                style={{ gridColumn: 2, gridRow: allDayRow }}
              >
                {allDayBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => onTimeBlockClick(block)}
                    className="rounded px-2 py-0.5 text-[11px] text-left bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-950/80 transition-all border border-dashed border-red-300 dark:border-red-800"
                  >
                    <span className="font-medium text-red-700 dark:text-red-400">
                      {block.title}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── HOUR GUTTER LABELS ── */}
          {hours.map((hour, row) => (
            <div
              key={`gutter-${hour}`}
              className="border-r border-b border-border/50 text-right pr-2 text-[11px] text-muted-foreground flex items-start justify-end pt-0.5"
              style={{ gridColumn: 1, gridRow: hourRowStart + row }}
            >
              {formatHour(hour)}
            </div>
          ))}

          {/* ── HOUR BORDER LINES in the day column ── */}
          {hours.map((hour, row) => (
            <div
              key={`line-${hour}`}
              className="border-b border-border/50 hover:bg-primary/[0.04] transition-colors duration-150 cursor-pointer"
              style={{ gridColumn: 2, gridRow: hourRowStart + row }}
            />
          ))}

          {/* ── DAY COLUMN (spans all hour rows) ── */}
          <div
            ref={columnRef}
            className="relative"
            style={{
              gridColumn: 2,
              gridRow: `${hourRowStart} / ${hourRowEnd}`,
            }}
          >
            <CalendarDayColumn
              date={date}
              appointments={appointments}
              timeBlocks={timeBlocks}
              onSlotClick={onSlotClick}
              onTimeBlockClick={onTimeBlockClick}
              onDragSelect={onDragSelect}
              dragGhost={dragGhost}
              hiddenAppointmentId={aptDragVisual?.appointmentId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
