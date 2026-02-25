import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RESCHEDULABLE_STATUSES = ["requested", "confirmed", "checked_in"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { starts_at, ends_at } = body;

  if (!starts_at || !ends_at) {
    return NextResponse.json(
      { error: "starts_at and ends_at are required" },
      { status: 400 }
    );
  }

  // Verify the appointment exists and is in a reschedulable status
  const { data: existing, error: fetchError } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  if (!RESCHEDULABLE_STATUSES.includes(existing.status)) {
    return NextResponse.json(
      { error: `Cannot reschedule appointment with status "${existing.status}"` },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ starts_at, ends_at })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
