import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

  // Fetch metrics
  const [
    { count: totalClients },
    { data: monthAppointments },
    { data: monthPayments },
    { data: yearPayments },
    { count: activeSeries },
    { count: completedSeries },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("id, status")
      .gte("starts_at", startOfMonth)
      .in("status", ["confirmed", "completed", "checked_in"]),
    supabase
      .from("payments")
      .select("amount_cents, tax_cents")
      .gte("created_at", startOfMonth)
      .eq("status", "succeeded"),
    supabase
      .from("payments")
      .select("amount_cents, tax_cents")
      .gte("created_at", startOfYear)
      .eq("status", "succeeded"),
    supabase
      .from("series")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("series")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const monthRevenue = (monthPayments || []).reduce(
    (sum, p) => sum + p.amount_cents + p.tax_cents,
    0
  );
  const yearRevenue = (yearPayments || []).reduce(
    (sum, p) => sum + p.amount_cents + p.tax_cents,
    0
  );
  const monthSessions = monthAppointments?.length || 0;
  const completedThisMonth =
    monthAppointments?.filter((a) => a.status === "completed").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">Analytics</h1>
        <p className="text-muted-foreground">
          Business metrics and performance overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              ${(monthRevenue / 100).toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Including HST</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Year to Date Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              ${(yearRevenue / 100).toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Since {new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{totalClients || 0}</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessions This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{monthSessions}</div>
            <p className="text-xs text-muted-foreground">
              {completedThisMonth} completed
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Series
            </CardTitle>
            <Activity className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{activeSeries || 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedSeries || 0} completed all-time
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Revenue / Session
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              $
              {completedThisMonth > 0
                ? (monthRevenue / 100 / completedThisMonth).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
