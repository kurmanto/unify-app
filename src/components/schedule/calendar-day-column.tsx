"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AppointmentBlock } from "@/components/schedule/appointment-block";
import { TimeBlockChip } from "@/components/schedule/time-block-chip";
import type {
  TimeBlock,
  CalendarSlotClickData,
  DragSelectData,
  CalendarAppointment,
  AppointmentDragGhost,
} from "@/types";

const START_HOUR = 7;
const END_HOUR = 22; // renders 7am–9pm (15 slots)
const TOTAL_HOURS = END_HOUR - START_HOUR;
const MIN_HOUR_HEIGHT = 48;
const DRAG_THRESHOLD_PX = 5;
const DRAG_THRESHOLD_MS = 150;
const SLOT_MINUTES = 15;

interface CalendarDayColumnProps {
  date: Date;
  appointments: CalendarAppointment[];
  timeBlocks: TimeBlock[];
  onSlotClick: (data: CalendarSlotClickData) => void;
  onTimeBlockClick: (block: TimeBlock) => void;
  onDragSelect: (data: DragSelectData) => void;
  /** Ghost to render in this column during cross-day drag */
  dragGhost?: AppointmentDragGhost;
  /** Hide this appointment (it's being dragged) */
  hiddenAppointmentId?: string;
}

function getMinutesOfDay(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
}

function minutesToPercent(minutes: number): number {
  const clamped = Math.max(minutes, START_HOUR * 60);
  return ((clamped - START_HOUR * 60) / (TOTAL_HOURS * 60)) * 100;
}

function clampedPercent(startMin: number, endMin: number): number {
  const cStart = Math.max(startMin, START_HOUR * 60);
  const cEnd = Math.min(endMin, END_HOUR * 60);
  if (cEnd <= cStart) return 0;
  return ((cEnd - cStart) / (TOTAL_HOURS * 60)) * 100;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isAllDayBlock(block: TimeBlock): boolean {
  const startMin = getMinutesOfDay(block.starts_at);
  const endMin = getMinutesOfDay(block.ends_at);
  return startMin < START_HOUR * 60 && endMin >= (END_HOUR - 1) * 60;
}

export function CalendarDayColumn({
  date,
  appointments,
  timeBlocks,
  onSlotClick,
  onTimeBlockClick,
  onDragSelect,
  dragGhost,
  hiddenAppointmentId,
}: CalendarDayColumnProps) {
  const dateStr = formatDateParam(date);
  const [now, setNow] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startY: number;
    startMin: number;
    timestamp: number;
  } | null>(null);
  const [selection, setSelection] = useState<{
    startMinutes: number;
    endMinutes: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const isToday = date.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine =
    isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;

  const getMinutesFromY = useCallback((clientY: number): number => {
    const el = gridRef.current;
    if (!el) return START_HOUR * 60;
    const rect = el.getBoundingClientRect();
    const relY = clientY - rect.top;
    const raw = START_HOUR * 60 + (relY / rect.height) * TOTAL_HOURS * 60;
    const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;
    return Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, snapped));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      // Appointment blocks are handled by the parent view (week/day) for drag.
      // Skip them here so we don't start an empty-slot drag.
      if (target.closest("[data-appointment-block]")) return;
      if (target.closest("a") || target.closest("button")) return;
      const minutes = getMinutesFromY(e.clientY);
      dragRef.current = { startY: e.clientY, startMin: minutes, timestamp: Date.now() };
      setSelection(null);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getMinutesFromY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      if (Math.abs(e.clientY - dragRef.current.startY) < DRAG_THRESHOLD_PX) return;
      const minutes = getMinutesFromY(e.clientY);
      setSelection({
        startMinutes: Math.min(dragRef.current.startMin, minutes),
        endMinutes: Math.max(dragRef.current.startMin, minutes),
      });
    },
    [getMinutesFromY]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      const elapsed = Date.now() - drag.timestamp;
      const dy = Math.abs(e.clientY - drag.startY);
      if (elapsed < DRAG_THRESHOLD_MS && dy < DRAG_THRESHOLD_PX) {
        setSelection(null);
        onSlotClick({ date: dateStr, time: minutesToTime(drag.startMin) });
        return;
      }
      if (selection) {
        onDragSelect({
          date: dateStr,
          startTime: minutesToTime(selection.startMinutes),
          endTime: minutesToTime(selection.endMinutes),
        });
      }
      setSelection(null);
    },
    [dateStr, selection, onDragSelect, onSlotClick]
  );

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.starts_at);
    return (
      aptDate.getDate() === date.getDate() &&
      aptDate.getMonth() === date.getMonth() &&
      aptDate.getFullYear() === date.getFullYear()
    );
  });

  const dayBlocks = timeBlocks.filter((block) => {
    const blockDate = new Date(block.starts_at);
    return (
      blockDate.getDate() === date.getDate() &&
      blockDate.getMonth() === date.getMonth() &&
      blockDate.getFullYear() === date.getFullYear()
    );
  });

  const timedBlocks = dayBlocks.filter((b) => !isAllDayBlock(b));

  return (
    <div
      ref={gridRef}
      className="relative h-full w-full select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Current time indicator */}
      {showNowLine && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ top: `${minutesToPercent(nowMinutes)}%` }}
        >
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
            <div className="flex-1 h-0.5 bg-red-500" />
          </div>
        </div>
      )}

      {/* Timed blocks */}
      {timedBlocks.map((block) => {
        const startMin = getMinutesOfDay(block.starts_at);
        const endMin = getMinutesOfDay(block.ends_at);
        const h = clampedPercent(startMin, endMin);
        if (h <= 0) return null;
        return (
          <div
            key={block.id}
            className="absolute left-1 right-1 z-10"
            style={{
              top: `${minutesToPercent(startMin)}%`,
              height: `${h}%`,
            }}
          >
            <TimeBlockChip
              block={block}
              onClick={onTimeBlockClick}
              style={{ height: "100%" }}
            />
          </div>
        );
      })}

      {/* Appointments */}
      {dayAppointments.map((apt) => {
        if (apt.id === hiddenAppointmentId) return null;
        const startMin = getMinutesOfDay(apt.starts_at);
        const endMin = getMinutesOfDay(apt.ends_at);
        const h = clampedPercent(startMin, endMin);
        if (h <= 0) return null;
        return (
          <div
            key={apt.id}
            className="absolute left-1 right-1 z-10"
            style={{
              top: `${minutesToPercent(startMin)}%`,
              height: `${h}%`,
            }}
          >
            <AppointmentBlock
              appointment={apt}
              style={{ height: "100%" }}
              compact={endMin - startMin < 45}
            />
          </div>
        );
      })}

      {/* Drag ghost (from parent view during appointment drag) */}
      {dragGhost && (() => {
        const h = clampedPercent(dragGhost.startMinutes, dragGhost.endMinutes);
        if (h <= 0) return null;
        const apt = dragGhost.appointment;
        const compact = dragGhost.endMinutes - dragGhost.startMinutes < 45;
        return (
          <div
            className="absolute left-1 right-1 z-40 opacity-60 pointer-events-none"
            style={{
              top: `${minutesToPercent(dragGhost.startMinutes)}%`,
              height: `${h}%`,
            }}
          >
            <div
              className={`rounded-md border-l-[3px] border-l-primary text-xs bg-primary/10 h-full ${compact ? "p-1" : "p-1.5"}`}
              style={{ border: "2px dashed hsl(var(--primary))", cursor: "grabbing" }}
            >
              <p className="font-medium truncate">
                {apt.client?.first_name} {apt.client?.last_name}
              </p>
              {!compact && (
                <p className="text-muted-foreground truncate">
                  {apt.session_type?.name}
                </p>
              )}
            </div>
            <div className="absolute -top-5 left-0 text-[10px] font-medium text-primary bg-background/90 px-1 rounded shadow-sm whitespace-nowrap">
              {minutesToTime(dragGhost.startMinutes)} — {minutesToTime(dragGhost.endMinutes)}
            </div>
          </div>
        );
      })()}

      {/* Drag selection overlay */}
      {selection && (
        <div
          className="absolute left-1 right-1 z-30 bg-primary/10 border-2 border-dashed border-primary/40 rounded-md flex items-center justify-center pointer-events-none"
          style={{
            top: `${minutesToPercent(selection.startMinutes)}%`,
            height: `${clampedPercent(selection.startMinutes, selection.endMinutes)}%`,
          }}
        >
          <span className="text-xs font-medium text-primary/70">
            {minutesToTime(selection.startMinutes)}
            {" — "}
            {minutesToTime(selection.endMinutes)}
          </span>
        </div>
      )}
    </div>
  );
}

export { START_HOUR, END_HOUR, TOTAL_HOURS, MIN_HOUR_HEIGHT, SLOT_MINUTES };
