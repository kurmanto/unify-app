"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StickyNote, Search, Filter } from "lucide-react";
import type { SoapNote } from "@/types";

interface NoteRow extends SoapNote {
  appointment: {
    id: string;
    starts_at: string;
    session_number: number | null;
    client: { first_name: string; last_name: string } | null;
    session_type: { name: string } | null;
  } | null;
}

interface NotesListClientProps {
  notes: NoteRow[];
}

type StatusFilter = "all" | "draft" | "complete";

export function NotesListClient({ notes }: NotesListClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      // Status filter
      if (statusFilter !== "all" && note.status !== statusFilter) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const apt = note.appointment;
        const clientName = apt?.client
          ? `${apt.client.first_name} ${apt.client.last_name}`.toLowerCase()
          : "";
        const sessionType = apt?.session_type?.name?.toLowerCase() || "";
        if (!clientName.includes(q) && !sessionType.includes(q)) return false;
      }

      return true;
    });
  }, [notes, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          SOAP Notes
        </h1>
        <p className="text-muted-foreground">
          View and manage clinical documentation.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or session type..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "draft", "complete"] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s === "draft" ? "Draft" : "Complete"}
            </Button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} note{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Session Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  <StickyNote className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  {notes.length === 0 ? (
                    <>
                      <p>No SOAP notes yet.</p>
                      <p className="text-xs mt-1">
                        Notes are created when you check in an appointment.
                      </p>
                    </>
                  ) : (
                    <p>No notes match your filters.</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((note) => {
                const apt = note.appointment;
                const client = apt?.client || null;
                const sessionType = apt?.session_type || null;
                return (
                  <TableRow key={note.id} className="table-row-premium">
                    <TableCell className="font-medium">
                      {client
                        ? `${client.first_name} ${client.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {sessionType?.name || "—"}
                      {apt?.session_number ? (
                        <span className="text-muted-foreground">
                          {" "}
                          (#{apt.session_number})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {apt?.starts_at
                        ? new Date(apt.starts_at).toLocaleDateString("en-CA")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          note.status === "complete"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                        }
                      >
                        {note.status === "complete" ? "Complete" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/notes/${note.appointment_id}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {note.status === "complete" ? "View" : "Edit"}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
