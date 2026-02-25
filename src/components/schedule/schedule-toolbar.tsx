"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { ScheduleView } from "@/types";

const views: { value: ScheduleView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "list", label: "List" },
];

interface ScheduleToolbarProps {
  currentView: ScheduleView;
  dateLabel: string;
  prevDate: string;
  nextDate: string;
  currentDate: string;
  showWeekends: boolean;
  onToggleWeekends: () => void;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function ScheduleToolbar({
  currentView,
  dateLabel,
  prevDate,
  nextDate,
  currentDate,
  showWeekends,
  onToggleWeekends,
}: ScheduleToolbarProps) {
  const [miniCalOpen, setMiniCalOpen] = useState(false);

  const selectedCalDate = currentDate ? new Date(currentDate + "T12:00:00") : new Date();
  const isViewingToday = isSameDay(selectedCalDate, new Date());

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-1.5 py-1">
      {/* View Switcher */}
      <div className="flex items-center">
        {views.map((v) => (
          <Link
            key={v.value}
            href={`/schedule?view=${v.value}&date=${currentDate}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentView === v.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {/* Date Navigation (hidden for list view) */}
      {currentView !== "list" && (
        <>
          <div className="border-r h-5 mx-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/schedule?view=${currentView}&date=${prevDate}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>

            <Popover open={miniCalOpen} onOpenChange={setMiniCalOpen}>
              <PopoverTrigger asChild>
                <button className="text-sm font-medium min-w-[200px] text-center hover:text-primary transition-colors cursor-pointer">
                  {dateLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedCalDate}
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      const dateStr = `${y}-${m}-${d}`;
                      setMiniCalOpen(false);
                      window.location.href = `/schedule?view=day&date=${dateStr}`;
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/schedule?view=${currentView}&date=${nextDate}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="border-r h-5 mx-1" />
        </>
      )}

      {/* Right side: Today + Weekend toggle */}
      <div className="flex items-center gap-2">
        {currentView === "week" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleWeekends}
            className="gap-1.5"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {showWeekends ? "6-day" : "7-day"}
          </Button>
        )}
        {currentView !== "list" && (
          <Button
            variant={isViewingToday ? "ghost" : "default"}
            size="sm"
            asChild
          >
            <Link href={`/schedule?view=${currentView}`}>
              {isViewingToday ? "Today" : "Back to Today"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
