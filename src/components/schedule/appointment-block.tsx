"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AppointmentPopoverContent,
  statusBorderColor,
} from "@/components/schedule/appointment-popover-content";
import type { CalendarAppointment } from "@/types";

interface AppointmentBlockProps {
  appointment: CalendarAppointment;
  /** Height style for absolute positioning, e.g. "60px" */
  style?: React.CSSProperties;
  compact?: boolean;
}

export function AppointmentBlock({
  appointment,
  style,
  compact = false,
}: AppointmentBlockProps) {
  const client = appointment.client;
  const sessionType = appointment.session_type;
  const series = appointment.series;
  const borderClass = statusBorderColor[appointment.status] || "border-l-gray-400";

  const isCancelled = appointment.status === "cancelled" || appointment.status === "no_show";

  const seriesLabel =
    series && appointment.session_number
      ? `#${appointment.session_number}/${series.total_sessions}`
      : null;

  const block = (
    <div
      data-appointment-block
      data-appointment-id={appointment.id}
      data-appointment-status={appointment.status}
      className={`block rounded-md border-l-[3px] ${borderClass} text-xs hover:shadow-sm transition-all overflow-hidden ${compact ? "p-1" : "p-1.5"} ${
        isCancelled || appointment.status === "completed"
          ? "bg-muted/50 opacity-60 hover:opacity-80 cursor-default"
          : "bg-primary/10 hover:bg-primary/20 cursor-grab"
      }`}
      style={style}
    >
      <p className={`font-medium truncate ${isCancelled ? "line-through" : ""}`}>
        {client?.first_name} {client?.last_name}
        {seriesLabel && (
          <span className="ml-1 text-muted-foreground font-normal">{seriesLabel}</span>
        )}
      </p>
      {!compact && (
        <p className={`text-muted-foreground truncate ${isCancelled ? "line-through" : ""}`}>
          {sessionType?.name}
        </p>
      )}
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{block}</PopoverTrigger>
      <PopoverContent className="w-80 p-3" side="right" align="start">
        <AppointmentPopoverContent appointment={appointment} />
      </PopoverContent>
    </Popover>
  );
}
