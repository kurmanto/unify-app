"use client";

import { Calendar, Activity, Clock, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Series, Appointment, Payment } from "@/types";
import { getSessionPhase } from "../utils";

interface ClientStatsRowProps {
  appointments: Appointment[];
  activeSeries: Series | null;
  payments: Payment[];
}

function getPhaseLabel(phase: string | null) {
  switch (phase) {
    case "sleeve":
      return "Sleeve";
    case "core":
      return "Core";
    case "integration":
      return "Integration";
    default:
      return "N/A";
  }
}

export function ClientStatsRow({
  appointments,
  activeSeries,
  payments,
}: ClientStatsRowProps) {
  const completedSessions = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  const now = new Date().toISOString();
  const pastAppointments = appointments
    .filter((a) => a.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );
  const lastVisit = pastAppointments[0]?.starts_at;

  const futureAppointments = appointments
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
  const nextAppointment = futureAppointments[0]?.starts_at;

  const paidPayments = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = paidPayments.reduce(
    (sum, p) => sum + p.amount_cents + p.tax_cents,
    0
  );

  const phase = activeSeries
    ? getSessionPhase(activeSeries.current_session)
    : null;

  const stats = [
    {
      label: "Total Sessions",
      value: completedSessions,
      icon: TrendingUp,
    },
    {
      label: "Active Series",
      value: activeSeries
        ? `${activeSeries.current_session}/${activeSeries.total_sessions}`
        : "None",
      sublabel: activeSeries ? getPhaseLabel(phase) : undefined,
      icon: Activity,
      phaseColor: phase,
    },
    {
      label: "Last Visit",
      value: lastVisit
        ? new Date(lastVisit).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          })
        : "N/A",
      icon: Clock,
    },
    {
      label: "Next Appointment",
      value: nextAppointment
        ? new Date(nextAppointment).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          })
        : "None",
      icon: Calendar,
    },
    {
      label: "Total Revenue",
      value: `$${(totalRevenue / 100).toFixed(0)}`,
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            {stat.sublabel && (
              <span
                className={`text-xs font-medium ${
                  stat.phaseColor === "sleeve"
                    ? "text-blue-600"
                    : stat.phaseColor === "core"
                    ? "text-amber-600"
                    : stat.phaseColor === "integration"
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                }`}
              >
                {stat.sublabel}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
