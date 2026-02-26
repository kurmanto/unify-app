"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Mail, Phone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientAvatar } from "../client-avatar";
import type { Client } from "@/types";

interface ClientHeroHeaderProps {
  client: Client;
  onSchedule: () => void;
  onEdit: () => void;
}

export function ClientHeroHeader({ client, onSchedule, onEdit }: ClientHeroHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
        <Link href="/clients">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <ClientAvatar
        firstName={client.first_name}
        lastName={client.last_name}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          {client.first_name} {client.last_name}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {client.email}
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {client.phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {client.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          <Badge variant={client.intake_completed ? "default" : "outline"}>
            {client.intake_completed ? "Intake Complete" : "Intake Pending"}
          </Badge>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button onClick={onSchedule}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
}
