"use client";

import { useRef, useCallback, useState } from "react";
import type { DragSelectData } from "@/types";

const SLOT_MINUTES = 15;
const DRAG_THRESHOLD_PX = 5;
const DRAG_THRESHOLD_MS = 150;

interface UseDragSelectOptions {
  startHour: number;
  endHour: number;
  date: string; // "YYYY-MM-DD"
  onDragSelect: (data: DragSelectData) => void;
  onSlotClick: (data: { date: string; time: string }) => void;
}

interface DragState {
  startY: number;
  startTime: number;
  currentTime: number;
  timestamp: number;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clampMinutes(minutes: number, startHour: number, endHour: number): number {
  return Math.max(startHour * 60, Math.min(endHour * 60, minutes));
}

export function useDragSelect({
  startHour,
  endHour,
  date,
  onDragSelect,
  onSlotClick,
}: UseDragSelectOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [selection, setSelection] = useState<{
    startMinutes: number;
    endMinutes: number;
  } | null>(null);

  const getMinutesFromY = useCallback(
    (y: number): number => {
      const el = containerRef.current;
      if (!el) return startHour * 60;
      const rect = el.getBoundingClientRect();
      const relY = y - rect.top;
      const totalMinutes = (endHour - startHour) * 60;
      const fraction = relY / rect.height;
      const raw = startHour * 60 + fraction * totalMinutes;
      // Snap to 15-minute slots
      const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;
      return clampMinutes(snapped, startHour, endHour);
    },
    [startHour, endHour]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle left clicks on the container background
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      // Don't start drag on existing appointments/blocks
      if (target.closest("a") || target.closest("button")) return;

      const minutes = getMinutesFromY(e.clientY);
      dragRef.current = {
        startY: e.clientY,
        startTime: minutes,
        currentTime: minutes,
        timestamp: Date.now(),
      };
      setSelection(null);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getMinutesFromY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;

      const dy = Math.abs(e.clientY - dragRef.current.startY);
      if (dy < DRAG_THRESHOLD_PX) return;

      const minutes = getMinutesFromY(e.clientY);
      dragRef.current.currentTime = minutes;

      const start = Math.min(dragRef.current.startTime, minutes);
      const end = Math.max(dragRef.current.startTime, minutes);
      setSelection({ startMinutes: start, endMinutes: end });
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

      // Click vs. drag distinction
      if (elapsed < DRAG_THRESHOLD_MS && dy < DRAG_THRESHOLD_PX) {
        // Treat as click — open appointment dialog
        setSelection(null);
        onSlotClick({ date, time: minutesToTime(drag.startTime) });
        return;
      }

      if (selection) {
        onDragSelect({
          date,
          startTime: minutesToTime(selection.startMinutes),
          endTime: minutesToTime(selection.endMinutes),
        });
      }
      setSelection(null);
    },
    [date, selection, onDragSelect, onSlotClick]
  );

  return {
    containerRef,
    selection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
