"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { ClientAvatar } from "./client-avatar";
import { SeriesProgressRing } from "./series-progress-ring";
import type { ClientListItem } from "@/types";
import { getSessionPhase } from "./utils";

interface ClientCardProps {
  client: ClientListItem;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatUpcomingDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return date.toLocaleDateString("en-CA", { weekday: "short" });
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function ClientCard({ client }: ClientCardProps) {
  const series = client.active_series;
  const phase = series ? getSessionPhase(series.current_session) : null;

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="rounded-xl border bg-card p-4 card-hover cursor-pointer space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ClientAvatar firstName={client.first_name} lastName={client.last_name} />
            <div>
              <p className="font-medium text-sm">
                {client.first_name} {client.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>
          {series && (
            <SeriesProgressRing
              current={series.current_session}
              total={series.total_sessions}
              phase={phase ?? undefined}
              size={36}
            />
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {client.last_visit && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(client.last_visit)}
            </span>
          )}
          {client.next_appointment && (
            <span className="flex items-center gap-1 text-primary">
              <Calendar className="h-3 w-3" />
              {formatUpcomingDate(client.next_appointment)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {!client.intake_completed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Intake Pending
            </Badge>
          )}
          {client.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {series && phase && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${
                phase === "sleeve"
                  ? "border-blue-300 text-blue-700"
                  : phase === "core"
                  ? "border-amber-300 text-amber-700"
                  : "border-emerald-300 text-emerald-700"
              }`}
            >
              {phase}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
