import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    practitioner_id,
    session_type_id,
    date,
    time,
    client_first_name,
    client_last_name,
    client_email,
    client_phone,
  } = body;

  if (
    !practitioner_id ||
    !session_type_id ||
    !date ||
    !time ||
    !client_first_name ||
    !client_last_name ||
    !client_email
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Use service role key for public widget access
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Get session type for duration
  const { data: sessionType } = await supabase
    .from("session_types")
    .select("duration_minutes")
    .eq("id", session_type_id)
    .single();

  if (!sessionType) {
    return NextResponse.json(
      { error: "Session type not found" },
      { status: 404 }
    );
  }

  // Find or create client
  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("practitioner_id", practitioner_id)
    .eq("email", client_email)
    .single();

  if (!client) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        practitioner_id,
        first_name: client_first_name,
        last_name: client_last_name,
        email: client_email,
        phone: client_phone || null,
      })
      .select("id")
      .single();

    if (clientError) {
      return NextResponse.json(
        { error: "Failed to create client: " + clientError.message },
        { status: 500 }
      );
    }
    client = newClient;
  }

  // Create appointment
  const startsAt = new Date(`${date}T${time}`);
  const endsAt = new Date(
    startsAt.getTime() + sessionType.duration_minutes * 60 * 1000
  );

  const { data: appointment, error: aptError } = await supabase
    .from("appointments")
    .insert({
      practitioner_id,
      client_id: client.id,
      session_type_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "requested",
    })
    .select("id")
    .single();

  if (aptError) {
    return NextResponse.json(
      { error: "Failed to create appointment: " + aptError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      appointment_id: appointment.id,
      message: "Booking request submitted. You will receive a confirmation email.",
    },
    { status: 201 }
  );
}
