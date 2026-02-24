import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { ClientDialog } from "@/components/clients/client-dialog";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.or(
      `first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%,email.ilike.%${params.q}%`
    );
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client base and health records.
          </p>
        </div>
        <ClientDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </ClientDialog>
      </div>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search clients..."
            defaultValue={params.q}
            className="pl-9 input-premium"
          />
        </form>
      </div>

      <div className="rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Intake</TableHead>
              <TableHead className="text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!clients || clients.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No clients yet. Add your first client to get started.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="table-row-premium">
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {client.first_name} {client.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {client.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.intake_completed ? "default" : "outline"}
                    >
                      {client.intake_completed ? "Complete" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString("en-CA")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
