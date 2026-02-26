import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientDetailPageClient } from "@/components/clients/detail/client-detail-page-client";
import type { SoapNote } from "@/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch all related data in parallel
  const [
    { data: client, error: clientError },
    { data: appointments },
    { data: series },
    { data: intakeForms },
    { data: payments },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("appointments")
      .select("*, session_type:session_types(*)")
      .eq("client_id", id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("series")
      .select("*")
      .eq("client_id", id)
      .order("started_at", { ascending: false }),
    supabase
      .from("intake_forms")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (clientError || !client) {
    notFound();
  }

  // Fetch SOAP notes via appointment IDs (correct join through appointments)
  const appointmentIds = (appointments || []).map((a) => a.id);
  let soapNotes: SoapNote[] = [];

  if (appointmentIds.length > 0) {
    const { data } = await supabase
      .from("soap_notes")
      .select("*")
      .in("appointment_id", appointmentIds)
      .order("created_at", { ascending: false });
    soapNotes = (data || []) as SoapNote[];
  }

  return (
    <ClientDetailPageClient
      client={client}
      appointments={(appointments || []) as Parameters<typeof ClientDetailPageClient>[0]["appointments"]}
      series={(series || []) as Parameters<typeof ClientDetailPageClient>[0]["series"]}
      soapNotes={soapNotes}
      intakeForms={(intakeForms || []) as Parameters<typeof ClientDetailPageClient>[0]["intakeForms"]}
      payments={(payments || []) as Parameters<typeof ClientDetailPageClient>[0]["payments"]}
    />
  );
}
