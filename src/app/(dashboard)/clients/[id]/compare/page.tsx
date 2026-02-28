import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ComparePageClient } from "@/components/clients/compare/compare-page-client";
import type { SoapNote } from "@/types";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client, error: clientError }, { data: appointments }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase
        .from("appointments")
        .select("*, session_type:session_types(*)")
        .eq("client_id", id)
        .eq("status", "completed")
        .order("starts_at", { ascending: true }),
    ]);

  if (clientError || !client) {
    notFound();
  }

  const appointmentIds = (appointments || []).map((a) => a.id);
  let soapNotes: SoapNote[] = [];

  if (appointmentIds.length > 0) {
    const { data } = await supabase
      .from("soap_notes")
      .select("*")
      .in("appointment_id", appointmentIds)
      .order("created_at", { ascending: true });
    soapNotes = (data || []) as SoapNote[];
  }

  return (
    <ComparePageClient
      client={client}
      appointments={
        (appointments || []) as Parameters<
          typeof ComparePageClient
        >[0]["appointments"]
      }
      soapNotes={soapNotes}
    />
  );
}
