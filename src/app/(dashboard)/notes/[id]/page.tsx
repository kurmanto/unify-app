import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SoapEditorPage } from "@/components/notes/soap-editor-page";

export default async function SoapNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: appointmentId } = await params;
  const supabase = await createClient();

  // Fetch appointment with relations
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, client:clients!inner(*), session_type:session_types!inner(*), series:series(*)"
    )
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    notFound();
  }

  // Fetch existing SOAP note
  const { data: existingNote } = await supabase
    .from("soap_notes")
    .select("*")
    .eq("appointment_id", appointmentId)
    .single();

  return (
    <SoapEditorPage
      appointment={appointment as never}
      existingNote={existingNote}
    />
  );
}
