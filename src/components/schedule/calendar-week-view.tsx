"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

interface CalendarWeekViewProps {
  appointments: CalendarAppointment[];
  timeBlocks: TimeBlock[];
  rangeStart: string;
  showWeekends: boolean;
  onSlotClick: (data: CalendarSlotClickData) => void;
  onTimeBlockClick: (block: TimeBlock) => void;
  onDragSelect: (data: DragSelectData) => void;
  onAppointmentDrop?: (data: AppointmentDropData) => void;
}

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

export function CalendarWeekView({
  appointments,
  timeBlocks,
  rangeStart,
  showWeekends,
  onSlotClick,
  onTimeBlockClick,
  onDragSelect,
  onAppointmentDrop,
}: CalendarWeekViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Appointment drag state
  const aptDragRef = useRef<{
    appointmentId: string;
    startX: number;
    startY: number;
    originalStartMin: number;
    originalEndMin: number;
    durationMin: number;
    originalColumnIndex: number;
    grabOffsetMin: number; // offset from top of appointment to grab point
    captured: boolean;
  } | null>(null);
  const [aptDragVisual, setAptDragVisual] = useState<{
    appointmentId: string;
    targetColumnIndex: number;
    startMinutes: number;
    endMinutes: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
      setHeaderHeight(height);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  const start = new Date(rangeStart);
  const dayCount = showWeekends ? 7 : 6;

  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });

  // --- Drag helpers ---
  const getColumnIndexFromX = useCallback((clientX: number): number => {
    for (let i = 0; i < columnRefs.current.length; i++) {
      const el = columnRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return i;
    }
    const first = columnRefs.current[0]?.getBoundingClientRect();
    if (first && clientX < first.left) return 0;
    return Math.max(0, columnRefs.current.length - 1);
  }, []);

  const getMinutesFromY = useCallback((clientY: number): number => {
    const el = columnRefs.current[0];
    if (!el) return START_HOUR * 60;
    const rect = el.getBoundingClientRect();
    const relY = clientY - rect.top;
    const raw = START_HOUR * 60 + (relY / rect.height) * TOTAL_HOURS * 60;
    const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;
    return Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, snapped));
  }, []);

  // --- Appointment drag handlers (on the grid) ---
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

      const colIdx = getColumnIndexFromX(e.clientX);
      if (colIdx < 0) return;

      const originalStartMin = getMinutesOfDay(apt.starts_at);
      const originalEndMin = getMinutesOfDay(apt.ends_at);
      const grabMin = getMinutesFromY(e.clientY);

      aptDragRef.current = {
        appointmentId: aptId,
        startX: e.clientX,
        startY: e.clientY,
        originalStartMin,
        originalEndMin,
        durationMin: originalEndMin - originalStartMin,
        originalColumnIndex: colIdx,
        grabOffsetMin: grabMin - originalStartMin,
        captured: false,
      };
    },
    [appointments, getColumnIndexFromX, getMinutesFromY]
  );

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!aptDragRef.current) return;

      const dx = Math.abs(e.clientX - aptDragRef.current.startX);
      const dy = Math.abs(e.clientY - aptDragRef.current.startY);
      if (!aptDragRef.current.captured && dx < DRAG_THRESHOLD_PX && dy < DRAG_THRESHOLD_PX) return;

      // Capture on first threshold crossing so all subsequent events come here
      if (!aptDragRef.current.captured) {
        aptDragRef.current.captured = true;
        gridRef.current?.setPointerCapture(e.pointerId);
      }

      const colIdx = getColumnIndexFromX(e.clientX);
      const pointerMin = getMinutesFromY(e.clientY);
      const newStartMin = pointerMin - aptDragRef.current.grabOffsetMin;
      const dur = aptDragRef.current.durationMin;

      // Clamp within day bounds
      const clampedStart = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60 - dur, newStartMin));
      // Snap
      const snappedStart = Math.round(clampedStart / SLOT_MINUTES) * SLOT_MINUTES;

      setAptDragVisual({
        appointmentId: aptDragRef.current.appointmentId,
        targetColumnIndex: Math.max(0, Math.min(dayCount - 1, colIdx)),
        startMinutes: snappedStart,
        endMinutes: snappedStart + dur,
      });
    },
    [dayCount, getColumnIndexFromX, getMinutesFromY]
  );

  const handleGridPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!aptDragRef.current) return;

      const drag = aptDragRef.current;
      aptDragRef.current = null;

      if (!drag.captured) {
        // No drag — let the click through for the popover
        setAptDragVisual(null);
        return;
      }

      gridRef.current?.releasePointerCapture(e.pointerId);

      if (aptDragVisual && onAppointmentDrop) {
        // Check if position actually changed
        const samePosition =
          aptDragVisual.targetColumnIndex === drag.originalColumnIndex &&
          aptDragVisual.startMinutes === drag.originalStartMin;

        if (!samePosition) {
          const targetDay = days[aptDragVisual.targetColumnIndex];
          const startDate = new Date(targetDay);
          startDate.setHours(Math.floor(aptDragVisual.startMinutes / 60), aptDragVisual.startMinutes % 60, 0, 0);
          const endDate = new Date(targetDay);
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
    [days, aptDragVisual, onAppointmentDrop]
  );

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const END_HOUR = START_HOUR + TOTAL_HOURS;

  const allDayBlocksByDay = days.map((day) =>
    timeBlocks.filter((block) => {
      const blockDate = new Date(block.starts_at);
      return (
        blockDate.getDate() === day.getDate() &&
        blockDate.getMonth() === day.getMonth() &&
        blockDate.getFullYear() === day.getFullYear() &&
        isAllDayBlock(block)
      );
    })
  );
  const hasAnyAllDay = allDayBlocksByDay.some((b) => b.length > 0);

  // Row indices — everything lives in one grid
  const headerRow = 1;
  const allDayRow = hasAnyAllDay ? 2 : null;
  const hourRowStart = hasAnyAllDay ? 3 : 2;
  const hourRowEnd = hourRowStart + TOTAL_HOURS; // exclusive

  const rowTemplate = [
    "auto",
    ...(hasAnyAllDay ? ["auto"] : []),
    `repeat(${TOTAL_HOURS}, minmax(${MIN_HOUR_HEIGHT}px, 1fr))`,
  ].join(" ");

  // Build ghost props per column
  const ghostForColumn = (colIdx: number): AppointmentDragGhost | undefined => {
    if (!aptDragVisual || aptDragVisual.targetColumnIndex !== colIdx) return undefined;
    const apt = appointments.find((a) => a.id === aptDragVisual.appointmentId);
    if (!apt) return undefined;
    return {
      appointment: apt,
      startMinutes: aptDragVisual.startMinutes,
      endMinutes: aptDragVisual.endMinutes,
    };
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full py-0 gap-0 rounded-xl">
      <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
        <div
          ref={gridRef}
          className="grid min-w-[700px]"
          style={{
            gridTemplateColumns: `3.5rem repeat(${dayCount}, 1fr)`,
            gridTemplateRows: rowTemplate,
          }}
          onPointerDown={handleGridPointerDown}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onClickCapture={handleClickCapture}
        >
          {/* ── HEADER ROW ── */}
          <div
            ref={headerRef}
            className="sticky top-0 z-30 bg-background border-r border-b"
            style={{ gridColumn: 1, gridRow: headerRow }}
          />
          {days.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isSunday = day.getDay() === 0;
            const hasAllDay = allDayBlocksByDay[i].length > 0;
            const tint = isToday
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : hasAllDay
                ? "bg-red-50 dark:bg-red-950/20"
                : isSunday
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-background";
            return (
              <div
                key={`hdr-${day.toISOString()}`}
                className={`sticky top-0 z-30 border-b p-2 text-center ${
                  i < days.length - 1 ? "border-r" : ""
                } ${tint}`}
                style={{ gridColumn: i + 2, gridRow: headerRow }}
              >
                <p
                  className={`text-xs ${
                    isSunday
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {day.toLocaleDateString("en-CA", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-semibold font-heading leading-tight ${
                    isToday
                      ? "text-primary"
                      : isSunday
                        ? "text-orange-600 dark:text-orange-400"
                        : ""
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>
            );
          })}

          {/* ── ALL-DAY ROW (conditional) ── */}
          {allDayRow && (
            <>
              <div
                className="sticky z-30 bg-background border-r border-b flex items-center justify-end pr-2"
                style={{ gridColumn: 1, gridRow: allDayRow, top: headerHeight }}
              >
                <span className="text-[10px] text-muted-foreground">
                  ALL DAY
                </span>
              </div>
              {allDayBlocksByDay.map((blocks, i) => {
                const hasAllDay = blocks.length > 0;
                const isToday = days[i].toDateString() === new Date().toDateString();
                const adBg = hasAllDay
                  ? "bg-red-50 dark:bg-red-950/20"
                  : isToday
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-background";
                return (
                  <div
                    key={`ad-${days[i].toISOString()}`}
                    className={`sticky z-30 border-b px-1 py-1 min-h-[32px] flex flex-col justify-center ${
                      i < days.length - 1 ? "border-r" : ""
                    } ${adBg}`}
                    style={{ gridColumn: i + 2, gridRow: allDayRow, top: headerHeight }}
                  >
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => onTimeBlockClick(block)}
                        className="w-full rounded px-2 py-0.5 text-[11px] text-left bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-950/80 transition-all border border-dashed border-red-300 dark:border-red-800 truncate"
                      >
                        <span className="font-medium text-red-700 dark:text-red-400">
                          {block.title}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
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

          {/* ── DAY COLUMN BACKGROUNDS (sunday / all-day tints) ── */}
          {days.map((day, i) => {
            const isSunday = day.getDay() === 0;
            const hasAllDay = allDayBlocksByDay[i].length > 0;
            const bg = hasAllDay
              ? "bg-red-50/40 dark:bg-red-950/10"
              : isSunday
                ? "bg-orange-50/30 dark:bg-orange-950/5"
                : "";
            if (!bg) return null;
            return (
              <div
                key={`bg-${day.toISOString()}`}
                className={`pointer-events-none ${bg}`}
                style={{
                  gridColumn: i + 2,
                  gridRow: `${hourRowStart} / ${hourRowEnd}`,
                }}
              />
            );
          })}

          {/* ── HOUR BORDER LINES in each day column ── */}
          {days.map((day, colIdx) =>
            hours.map((hour, row) => (
              <div
                key={`line-${colIdx}-${hour}`}
                className={`border-b border-border/50 hover:bg-primary/[0.04] transition-colors duration-150 cursor-pointer ${
                  colIdx < days.length - 1 ? "border-r" : ""
                }`}
                style={{
                  gridColumn: colIdx + 2,
                  gridRow: hourRowStart + row,
                }}
              />
            ))
          )}

          {/* ── CALENDAR DAY COLUMNS (span all hour rows) ── */}
          {days.map((day, i) => (
            <div
              key={`col-${day.toISOString()}`}
              ref={(el) => { columnRefs.current[i] = el; }}
              className="relative"
              style={{
                gridColumn: i + 2,
                gridRow: `${hourRowStart} / ${hourRowEnd}`,
              }}
            >
              <CalendarDayColumn
                date={day}
                appointments={appointments}
                timeBlocks={timeBlocks}
                onSlotClick={onSlotClick}
                onTimeBlockClick={onTimeBlockClick}
                onDragSelect={onDragSelect}
                dragGhost={ghostForColumn(i)}
                hiddenAppointmentId={aptDragVisual?.appointmentId}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
