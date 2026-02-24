import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentDate = params.date ? new Date(params.date) : new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, client:clients(first_name, last_name), session_type:session_types(name, duration_minutes)")
    .gte("starts_at", startOfWeek.toISOString())
    .lte("starts_at", endOfWeek.toISOString())
    .order("starts_at", { ascending: true });

  // Group appointments by day
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const prevWeek = new Date(startOfWeek);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(startOfWeek);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9am-6pm

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/calendar?date=${prevWeek.toISOString().split("T")[0]}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {startOfWeek.toLocaleDateString("en-CA", {
              month: "long",
              day: "numeric",
            })}{" "}
            —{" "}
            {endOfWeek.toLocaleDateString("en-CA", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/calendar?date=${nextWeek.toISOString().split("T")[0]}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/calendar">Today</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-6">
            {/* Time column header */}
            <div className="border-b border-r p-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </div>
            {/* Day headers */}
            {days.map((day) => {
              const isToday =
                day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day.toISOString()}
                  className={`border-b p-3 text-center ${isToday ? "bg-primary/5" : ""}`}
                >
                  <p className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("en-CA", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-lg font-semibold font-heading ${isToday ? "text-primary" : ""}`}
                  >
                    {day.getDate()}
                  </p>
                </div>
              );
            })}

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={`row-${hour}`} className="contents">
                <div
                  className="border-r p-2 text-right text-xs text-muted-foreground"
                >
                  {hour}:00
                </div>
                {days.map((day) => {
                  const dayAppts = (appointments || []).filter((apt) => {
                    const aptDate = new Date(apt.starts_at);
                    return (
                      aptDate.getDate() === day.getDate() &&
                      aptDate.getMonth() === day.getMonth() &&
                      aptDate.getHours() === hour
                    );
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="border-b border-r p-1 min-h-[60px]"
                    >
                      {dayAppts.map((apt) => {
                        const client = apt.client as Record<string, string>;
                        const sessionType = apt.session_type as Record<string, unknown>;
                        return (
                          <Link
                            key={apt.id}
                            href={`/appointments/${apt.id}`}
                            className="block rounded-md bg-primary/10 p-1.5 text-xs hover:bg-primary/20 hover:shadow-sm transition-all"
                          >
                            <p className="font-medium truncate">
                              {client?.first_name} {client?.last_name}
                            </p>
                            <p className="text-muted-foreground truncate">
                              {sessionType?.name as string}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
