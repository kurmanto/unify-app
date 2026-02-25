"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusBadgeClass: Record<string, string> = {
  requested: "badge-requested",
  confirmed: "badge-confirmed",
  checked_in: "badge-checked_in",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  no_show: "badge-no_show",
};

interface ListAppointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_status: string | null;
  client_id: string;
  session_number: number | null;
  client: { first_name: string; last_name: string } | null;
  session_type: { name: string } | null;
}

interface AppointmentListViewProps {
  appointments: ListAppointment[];
  initialStatus: string;
}

export function AppointmentListView({
  appointments,
  initialStatus,
}: AppointmentListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "list");
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select defaultValue={initialStatus || "all"} onValueChange={handleStatusChange}>
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
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => {
                const client = apt.client;
                const sessionType = apt.session_type;
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
                      {sessionType?.name}
                      {apt.session_number && (
                        <span className="text-muted-foreground">
                          {" "}
                          (#{apt.session_number})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass[apt.status] || ""}
                      >
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
