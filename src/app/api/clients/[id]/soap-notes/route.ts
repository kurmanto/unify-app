import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // First get all appointment IDs for this client
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("client_id", id);

  if (!appointments || appointments.length === 0) {
    return NextResponse.json([]);
  }

  const appointmentIds = appointments.map((a) => a.id);

  // Then fetch SOAP notes for those appointments
  const { data: soapNotes, error } = await supabase
    .from("soap_notes")
    .select("*, appointment:appointments(id, starts_at, session_number, series_id, status, session_type:session_types(name))")
    .in("appointment_id", appointmentIds)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(soapNotes || []);
}
