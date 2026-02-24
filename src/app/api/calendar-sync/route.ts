import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, appointment_id } = body;

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json(
      { error: "Google Calendar not configured" },
      { status: 500 }
    );
  }

  switch (action) {
    case "sync_appointment": {
      // Get appointment details
      const { data: appointment } = await supabase
        .from("appointments")
        .select("*, client:clients(first_name, last_name, email), session_type:session_types(name)")
        .eq("id", appointment_id)
        .single();

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      const client = appointment.client as Record<string, string>;
      const sessionType = appointment.session_type as Record<string, string>;

      // Placeholder for Google Calendar API call
      // In production, use the stored OAuth tokens to create/update calendar events
      return NextResponse.json({
        message: "Calendar sync requires Google OAuth setup",
        event_details: {
          summary: `${sessionType?.name} - ${client?.first_name} ${client?.last_name}`,
          start: appointment.starts_at,
          end: appointment.ends_at,
        },
      });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
