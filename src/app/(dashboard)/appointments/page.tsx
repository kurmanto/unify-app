import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";

const statusBadgeClass: Record<string, string> = {
  requested: "badge-requested",
  confirmed: "badge-confirmed",
  checked_in: "badge-checked_in",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  no_show: "badge-no_show",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select("*, client:clients(*), session_type:session_types(*)")
    .order("starts_at", { ascending: false })
    .limit(50);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data: appointments } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Appointments</h1>
          <p className="text-muted-foreground">
            View and manage all client sessions.
          </p>
        </div>
        <AppointmentDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </AppointmentDialog>
      </div>

      <div className="flex items-center gap-4">
        <form>
          <Select name="status" defaultValue={params.status || "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      <div className="rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Session Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!appointments || appointments.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => {
                const client = apt.client as Record<string, string> | null;
                const sessionType = apt.session_type as Record<string, unknown> | null;
                return (
                  <TableRow key={apt.id} className="table-row-premium">
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(apt.starts_at).toLocaleDateString("en-CA", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.starts_at).toLocaleTimeString("en-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" — "}
                          {new Date(apt.ends_at).toLocaleTimeString("en-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${apt.client_id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {client?.first_name} {client?.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {sessionType?.name as string}
                      {apt.session_number && (
                        <span className="text-muted-foreground">
                          {" "}
                          (#{apt.session_number})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[apt.status] || ""}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`badge-${apt.payment_status || "unpaid"}`}
                      >
                        {apt.payment_status || "unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/appointments/${apt.id}`}>View</Link>
                      </Button>
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
