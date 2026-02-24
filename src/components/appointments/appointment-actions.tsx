"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AppointmentStatus } from "@/types";

const statusTransitions: Record<string, { label: string; next: AppointmentStatus }[]> = {
  requested: [
    { label: "Confirm", next: "confirmed" },
    { label: "Cancel", next: "cancelled" },
  ],
  confirmed: [
    { label: "Check In", next: "checked_in" },
    { label: "Cancel", next: "cancelled" },
    { label: "No Show", next: "no_show" },
  ],
  checked_in: [
    { label: "Complete", next: "completed" },
  ],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function AppointmentActions({
  appointmentId,
  currentStatus,
  seriesId,
  sessionNumber,
}: {
  appointmentId: string;
  currentStatus: string;
  seriesId?: string | null;
  sessionNumber?: number | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const transitions = statusTransitions[currentStatus] || [];

  async function updateStatus(newStatus: AppointmentStatus) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    // Complete the series when session 10 is marked completed
    if (newStatus === "completed" && seriesId && sessionNumber === 10) {
      const { error: seriesError } = await supabase
        .from("series")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", seriesId);

      if (seriesError) {
        toast.error("Appointment completed, but failed to complete series: " + seriesError.message);
      } else {
        toast.success("Appointment completed — Ten Series finished!");
        router.refresh();
        return;
      }
    }

    toast.success(`Appointment ${newStatus}`);
    router.refresh();
  }

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions available for {currentStatus} appointments.
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      {transitions.map((t) => (
        <Button
          key={t.next}
          variant={t.next === "cancelled" || t.next === "no_show" ? "destructive" : "default"}
          onClick={() => updateStatus(t.next)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
