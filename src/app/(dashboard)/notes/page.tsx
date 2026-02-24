import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";

export default async function NotesPage() {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("soap_notes")
    .select(
      "*, appointment:appointments(id, starts_at, session_number, client:clients(first_name, last_name), session_type:session_types(name))"
    )
    .order("created_at", { ascending: false })
    .limit(50);

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
            {!notes || notes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  <StickyNote className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p>No SOAP notes yet.</p>
                  <p className="text-xs mt-1">
                    Notes are created from appointment detail pages.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => {
                const apt = note.appointment as Record<string, unknown> | null;
                const client = (apt?.client as Record<string, string>) || null;
                const sessionType = (apt?.session_type as Record<string, string>) || null;
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
                          (#{apt.session_number as number})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {apt?.starts_at
                        ? new Date(
                            apt.starts_at as string
                          ).toLocaleDateString("en-CA")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={note.subjective ? "default" : "outline"}>
                        {note.subjective ? "Completed" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/notes/${note.appointment_id}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Edit
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
