import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch today's appointments
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*, client:clients(*), session_type:session_types(*)")
    .gte("starts_at", startOfDay)
    .lte("starts_at", endOfDay)
    .order("starts_at", { ascending: true });

  // Fetch summary stats
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: weekAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("starts_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .in("status", ["confirmed", "completed", "checked_in"]);

  const appointments = todayAppointments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s your day at a glance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Week
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{weekAppointments || 0}</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{totalClients || 0}</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Session
            </CardTitle>
            <DollarSign className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {appointments.length > 0
                ? new Date(appointments[0].starts_at).toLocaleTimeString(
                    "en-CA",
                    { hour: "2-digit", minute: "2-digit" }
                  )
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt: Record<string, unknown>) => {
                const client = apt.client as Record<string, string> | null;
                const sessionType = apt.session_type as Record<string, unknown> | null;
                return (
                  <div
                    key={apt.id as string}
                    className="flex items-center justify-between rounded-lg border p-4 table-row-premium transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground min-w-[60px]">
                        {new Date(apt.starts_at as string).toLocaleTimeString("en-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div>
                        <p className="font-medium">
                          {client?.first_name} {client?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sessionType?.name as string}
                          {apt.session_number
                            ? ` — Session ${apt.session_number}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`badge-${apt.status as string}`}
                    >
                      {apt.status as string}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
