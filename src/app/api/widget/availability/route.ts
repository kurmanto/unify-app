import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const practitionerId = searchParams.get("practitioner_id");
  const date = searchParams.get("date"); // YYYY-MM-DD
  const sessionTypeId = searchParams.get("session_type_id");

  if (!practitionerId || !date || !sessionTypeId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Use service role key for public widget access
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Get practitioner schedule config
  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("schedule_config")
    .eq("id", practitionerId)
    .single();

  if (!practitioner) {
    return NextResponse.json(
      { error: "Practitioner not found" },
      { status: 404 }
    );
  }

  // Get session type duration
  const { data: sessionType } = await supabase
    .from("session_types")
    .select("duration_minutes")
    .eq("id", sessionTypeId)
    .single();

  if (!sessionType) {
    return NextResponse.json(
      { error: "Session type not found" },
      { status: 404 }
    );
  }

  const scheduleConfig = practitioner.schedule_config as {
    days: Array<{
      day: number;
      enabled: boolean;
      start_time: string;
      end_time: string;
      breaks: Array<{ start: string; end: string }>;
    }>;
    buffer_minutes: number;
  };

  const requestedDate = new Date(date + "T00:00:00");
  const dayOfWeek = requestedDate.getDay();
  const dayConfig = scheduleConfig.days.find((d) => d.day === dayOfWeek);

  if (!dayConfig || !dayConfig.enabled) {
    return NextResponse.json({ slots: [] });
  }

  // Get existing appointments for the day
  const dayStart = new Date(date + "T00:00:00").toISOString();
  const dayEnd = new Date(date + "T23:59:59").toISOString();

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("practitioner_id", practitionerId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd)
    .not("status", "in", '("cancelled","no_show")');

  // Generate available slots
  const slots: string[] = [];
  const duration = sessionType.duration_minutes;
  const buffer = scheduleConfig.buffer_minutes;

  const [startHour, startMin] = dayConfig.start_time.split(":").map(Number);
  const [endHour, endMin] = dayConfig.end_time.split(":").map(Number);

  let currentTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  while (currentTime + duration <= endTime) {
    const slotStart = new Date(requestedDate);
    slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    // Check breaks
    const inBreak = dayConfig.breaks.some((brk) => {
      const [bStartH, bStartM] = brk.start.split(":").map(Number);
      const [bEndH, bEndM] = brk.end.split(":").map(Number);
      const breakStart = bStartH * 60 + bStartM;
      const breakEnd = bEndH * 60 + bEndM;
      return currentTime < breakEnd && currentTime + duration > breakStart;
    });

    // Check conflicts with existing appointments
    const hasConflict = (existingAppointments || []).some((apt) => {
      const aptStart = new Date(apt.starts_at).getTime();
      const aptEnd = new Date(apt.ends_at).getTime();
      return (
        slotStart.getTime() < aptEnd + buffer * 60 * 1000 &&
        slotEnd.getTime() + buffer * 60 * 1000 > aptStart
      );
    });

    if (!inBreak && !hasConflict) {
      slots.push(
        slotStart.toLocaleTimeString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }

    currentTime += 30; // 30-minute slot intervals
  }

  return NextResponse.json({ slots });
}
