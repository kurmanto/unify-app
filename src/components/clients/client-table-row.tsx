"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ClientAvatar } from "./client-avatar";
import { SeriesProgressRing } from "./series-progress-ring";
import type { ClientListItem } from "@/types";
import { getSessionPhase } from "./utils";

interface ClientTableRowProps {
  client: ClientListItem;
}

export function ClientTableRow({ client }: ClientTableRowProps) {
  const series = client.active_series;
  const phase = series ? getSessionPhase(series.current_session) : null;

  return (
    <TableRow className="table-row-premium">
      <TableCell>
        <Link
          href={`/clients/${client.id}`}
          className="flex items-center gap-3 hover:text-primary transition-colors"
        >
          <ClientAvatar firstName={client.first_name} lastName={client.last_name} size="sm" />
          <div>
            <p className="font-medium">
              {client.first_name} {client.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{client.email}</p>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {client.phone || "\u2014"}
      </TableCell>
      <TableCell>
        {series ? (
          <div className="flex items-center gap-2">
            <SeriesProgressRing
              current={series.current_session}
              total={series.total_sessions}
              phase={phase ?? undefined}
              size={28}
              strokeWidth={2.5}
            />
            <span className="text-xs text-muted-foreground capitalize">{phase}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">\u2014</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {client.last_visit
          ? new Date(client.last_visit).toLocaleDateString("en-CA", {
              month: "short",
              day: "numeric",
            })
          : "\u2014"}
      </TableCell>
      <TableCell className="text-sm">
        {client.next_appointment ? (
          <span className="text-primary">
            {new Date(client.next_appointment).toLocaleDateString("en-CA", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">\u2014</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {client.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={client.intake_completed ? "default" : "outline"}>
          {client.intake_completed ? "Complete" : "Pending"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
