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

  const { appointment_id } = await request.json();
  if (!appointment_id) {
    return NextResponse.json({ error: "appointment_id required" }, { status: 400 });
  }

  // Check if a note already exists for this appointment
  const { data: existing } = await supabase
    .from("soap_notes")
    .select("id")
    .eq("appointment_id", appointment_id)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Create a draft note
  const { data, error } = await supabase
    .from("soap_notes")
    .insert({
      appointment_id,
      practitioner_id: user.id,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
