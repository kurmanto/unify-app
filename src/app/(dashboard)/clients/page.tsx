import { createClient } from "@/lib/supabase/server";
import { ClientsPageClient } from "@/components/clients/clients-page-client";
import type { ClientListItem, Series } from "@/types";

export default async function ClientsPage() {
  const supabase = await createClient();

  // Fetch clients with related series and appointments
  const [{ data: clients }, { data: allSeries }, { data: allAppointments }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("series")
        .select("*")
        .order("started_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, client_id, starts_at, status")
        .order("starts_at", { ascending: false }),
    ]);

  const now = new Date().toISOString();

  // Compute enriched client list items
  const enrichedClients: ClientListItem[] = (clients || []).map((client) => {
    const clientSeries = (allSeries || []).filter(
      (s) => s.client_id === client.id
    );
    const clientAppointments = (allAppointments || []).filter(
      (a) => a.client_id === client.id
    );

    const activeSeries =
      (clientSeries.find((s) => s.status === "active") as Series) || null;

    const completedAppointments = clientAppointments.filter(
      (a) => a.status === "completed"
    );
    const lastVisit = completedAppointments[0]?.starts_at || null;

    const futureAppointments = clientAppointments
      .filter(
        (a) =>
          a.starts_at > now &&
          a.status !== "cancelled" &&
          a.status !== "no_show"
      )
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
    const nextAppointment = futureAppointments[0]?.starts_at || null;

    return {
      ...client,
      active_series: activeSeries,
      last_visit: lastVisit,
      next_appointment: nextAppointment,
      total_completed_sessions: completedAppointments.length,
    };
  });

  // Extract all unique tags
  const allTags = [
    ...new Set(
      enrichedClients.flatMap((c) => c.tags || []).filter(Boolean)
    ),
  ].sort();

  return <ClientsPageClient clients={enrichedClients} allTags={allTags} />;
}
