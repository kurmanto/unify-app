"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isSameWeek,
  format,
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AppointmentPopoverContent,
  statusBorderColor,
} from "@/components/schedule/appointment-popover-content";
import { useActivePopover } from "@/components/schedule/active-popover-context";
import type { CalendarAppointment } from "@/types";

interface CalendarMonthViewProps {
  appointments: CalendarAppointment[];
  currentDate: string;
}

export function CalendarMonthView({
  appointments,
  currentDate,
}: CalendarMonthViewProps) {
  const router = useRouter();
  const { activeId, toggle, close } = useActivePopover();
  const current = new Date(currentDate + "T12:00:00");
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const today = new Date();
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekCount = days.length / 7;

  // Chunk days into weeks (groups of 7)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isCurrentWeek = (weekMonday: Date) =>
    isSameWeek(weekMonday, today, { weekStartsOn: 1 });

  return (
    <div className="rounded-xl border shadow-sm bg-card overflow-hidden flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid — stretches to fill remaining space */}
      <div className="flex-1 flex flex-col" style={{ display: "grid", gridTemplateRows: `repeat(${weekCount}, 1fr)` }}>
        {weeks.map((week) => {
          const weekMonday = week[0];
          const weekDateStr = format(weekMonday, "yyyy-MM-dd");
          const isThisWeek = isCurrentWeek(weekMonday);

          return (
            <div
              key={weekDateStr}
              className={`group/week relative cursor-pointer ${
                isThisWeek ? "bg-primary/[0.03]" : ""
              }`}
              onClick={(e) => {
                // Only navigate if the click wasn't on an interactive element
                const target = e.target as HTMLElement;
                if (target.closest("a") || target.closest("button")) return;
                router.push(`/schedule?view=week&date=${weekDateStr}`);
              }}
            >
              {/* Current week left accent */}
              {isThisWeek && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary z-20 pointer-events-none" />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 group-hover/week:bg-primary/[0.03] transition-colors pointer-events-none" />

              {/* Day cells in their own grid so nth-child works correctly */}
              <div className="grid grid-cols-7 h-full">
              {week.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, current);
                const isToday = isSameDay(day, today);
                const dateStr = format(day, "yyyy-MM-dd");

                const dayAppts = appointments.filter((apt) =>
                  isSameDay(new Date(apt.starts_at), day)
                );

                const visibleAppts = dayAppts.slice(0, 3);
                const moreCount = dayAppts.length - 3;

                return (
                  <div
                    key={dateStr}
                    className={`relative border-b p-2 flex flex-col ${
                      dayIdx < 6 ? "border-r" : ""
                    } ${!isCurrentMonth ? "bg-muted/10" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex justify-end mb-1">
                      <Link
                        href={`/schedule?view=day&date=${dateStr}`}
                        className={`relative z-20 w-6 h-6 flex items-center justify-center text-sm leading-none rounded-full transition-colors hover:bg-muted ${
                          isToday
                            ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                            : isCurrentMonth
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/50"
                        }`}
                      >
                        {day.getDate()}
                      </Link>
                    </div>

                    {/* Appointment chips with shared popover */}
                    <div className="relative z-20 flex-1 space-y-0.5 min-h-0 overflow-hidden">
                      {visibleAppts.map((apt) => {
                        const client = apt.client;
                        const sessionType = apt.session_type;
                        const series = apt.series;
                        const borderClass = statusBorderColor[apt.status] || "border-l-gray-400";
                        const isCancelled = apt.status === "cancelled" || apt.status === "no_show";

                        const startTime = new Date(apt.starts_at).toLocaleTimeString("en-CA", {
                          hour: "numeric",
                          minute: "2-digit",
                        });

                        const seriesTag =
                          series && apt.session_number
                            ? `#${apt.session_number}/${series.total_sessions}`
                            : null;

                        const chipLabel = [
                          startTime,
                          client ? `${client.first_name.charAt(0)}. ${client.last_name}` : null,
                          seriesTag,
                        ]
                          .filter(Boolean)
                          .join(" \u00b7 ");

                        return (
                          <Popover
                            key={apt.id}
                            open={activeId === apt.id}
                            onOpenChange={(open) => {
                              if (open) toggle(apt.id);
                              else close();
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={`w-full text-left rounded border-l-2 ${borderClass} text-[11px] leading-tight truncate px-1.5 py-0.5 transition-colors ${
                                  isCancelled
                                    ? "bg-muted/50 text-muted-foreground line-through opacity-60 hover:opacity-80"
                                    : "bg-primary/10 text-foreground hover:bg-primary/20"
                                }`}
                              >
                                {chipLabel}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 p-3"
                              side="right"
                              align="start"
                              onInteractOutside={(e) => e.preventDefault()}
                              onPointerDownOutside={(e) => e.preventDefault()}
                            >
                              <AppointmentPopoverContent appointment={apt} />
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                      {moreCount > 0 && (
                        <Link
                          href={`/schedule?view=day&date=${dateStr}`}
                          className="block text-[10px] text-muted-foreground/70 font-medium px-1 hover:text-foreground transition-colors"
                        >
                          +{moreCount} more
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
