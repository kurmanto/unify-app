import { createClient } from "@/lib/supabase/server";
import { SchedulePageClient } from "@/components/schedule/schedule-page-client";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  format,
} from "date-fns";
import type { ScheduleView } from "@/types";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string; date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const view = (params.view || "week") as ScheduleView;
  const status = params.status || "all";
  const currentDate = params.date ? new Date(params.date + "T12:00:00") : new Date();

  // Compute date range based on view
  let rangeStart: Date;
  let rangeEnd: Date;
  let prevDate: string;
  let nextDate: string;
  let dateLabel: string;

  switch (view) {
    case "day":
      rangeStart = startOfDay(currentDate);
      rangeEnd = endOfDay(currentDate);
      prevDate = format(subDays(currentDate, 1), "yyyy-MM-dd");
      nextDate = format(addDays(currentDate, 1), "yyyy-MM-dd");
      dateLabel = format(currentDate, "EEEE, MMMM d, yyyy");
      break;
    case "month":
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);
      prevDate = format(subMonths(currentDate, 1), "yyyy-MM-dd");
      nextDate = format(addMonths(currentDate, 1), "yyyy-MM-dd");
      dateLabel = format(currentDate, "MMMM yyyy");
      break;
    case "list":
      // List view: no specific date range for fetching
      rangeStart = new Date(0);
      rangeEnd = new Date("2099-12-31");
      prevDate = "";
      nextDate = "";
      dateLabel = "";
      break;
    case "week":
    default:
      rangeStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      rangeEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      prevDate = format(subWeeks(currentDate, 1), "yyyy-MM-dd");
      nextDate = format(addWeeks(currentDate, 1), "yyyy-MM-dd");
      dateLabel = `${format(rangeStart, "MMM d")} — ${format(rangeEnd, "MMM d, yyyy")}`;
      break;
  }

  // Fetch calendar appointments for date range (day/week/month views)
  const calendarQuery = supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, session_number, series_id, client_id, client:clients(first_name, last_name, email, phone), session_type:session_types(name, duration_minutes), series:series(total_sessions, current_session)"
    )
    .gte("starts_at", rangeStart.toISOString())
    .lte("starts_at", rangeEnd.toISOString())
    .order("starts_at", { ascending: true });

  // Fetch time blocks for the date range
  const timeBlocksQuery = supabase
    .from("time_blocks")
    .select("*")
    .gte("starts_at", rangeStart.toISOString())
    .lte("starts_at", rangeEnd.toISOString())
    .order("starts_at", { ascending: true });

  // Fetch list appointments (with optional status filter)
  let listQuery = supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, payment_status, client_id, session_number, client:clients(first_name, last_name), session_type:session_types(name)"
    )
    .order("starts_at", { ascending: false })
    .limit(50);

  if (status && status !== "all") {
    listQuery = listQuery.eq("status", status);
  }

  const [
    { data: calendarAppointments },
    { data: timeBlocksData },
    { data: listAppointments },
  ] = await Promise.all([calendarQuery, timeBlocksQuery, listQuery]);

  return (
    <SchedulePageClient
      view={view}
      calendarAppointments={(calendarAppointments as any[]) || []}
      listAppointments={(listAppointments as any[]) || []}
      timeBlocks={timeBlocksData || []}
      initialStatus={status}
      rangeStart={rangeStart.toISOString()}
      rangeEnd={rangeEnd.toISOString()}
      prevDate={prevDate}
      nextDate={nextDate}
      dateLabel={dateLabel}
      currentDate={format(currentDate, "yyyy-MM-dd")}
    />
  );
}
