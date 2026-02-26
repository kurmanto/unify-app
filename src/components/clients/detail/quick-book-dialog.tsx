"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { isSeriesSessionType } from "@/lib/rolfing/ten-series";
import { SessionGuidePreview } from "@/components/appointments/session-guide-preview";
import type { Client, Series } from "@/types";

interface SessionTypeOption {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_package: boolean;
}

interface QuickBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  activeSeries: Series | null;
}

export function QuickBookDialog({
  open,
  onOpenChange,
  client,
  activeSeries,
}: QuickBookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeOption[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);
  const [useSeriesLink, setUseSeriesLink] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const selectedSessionType = sessionTypes.find((t) => t.id === selectedType);
  const isSeriesType = selectedSessionType
    ? isSeriesSessionType(selectedSessionType.name)
    : false;

  async function loadSessionTypes() {
    const { data } = await supabase
      .from("session_types")
      .select("id, name, duration_minutes, price_cents, is_package")
      .order("name");
    setSessionTypes((data || []).filter((t: SessionTypeOption) => !t.is_package));

    // Auto-select Ten Series session type if client has active series
    if (activeSeries && data) {
      const seriesType = data.find(
        (t: SessionTypeOption) => isSeriesSessionType(t.name)
      );
      if (seriesType) {
        setSelectedType(seriesType.id);
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadSessionTypes();
    } else {
      setSelectedType("");
      setSessionNumber(null);
      setUseSeriesLink(true);
    }
  }, [open]);

  // Auto-suggest session number for series clients
  useEffect(() => {
    if (isSeriesType && activeSeries && useSeriesLink) {
      setSessionNumber(activeSeries.current_session + 1);
    } else if (!isSeriesType) {
      setSessionNumber(null);
    }
  }, [isSeriesType, activeSeries?.id, useSeriesLink]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const notes = formData.get("notes") as string;

    const sessionType = sessionTypes.find((t) => t.id === selectedType);
    if (!sessionType) {
      toast.error("Please select a session type");
      setLoading(false);
      return;
    }

    const startsAt = new Date(`${date}T${time}`);
    const endsAt = new Date(
      startsAt.getTime() + sessionType.duration_minutes * 60 * 1000
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const seriesId =
      isSeriesType && activeSeries && useSeriesLink ? activeSeries.id : null;

    const { error } = await supabase.from("appointments").insert({
      practitioner_id: user.id,
      client_id: client.id,
      session_type_id: selectedType,
      series_id: seriesId,
      session_number: sessionNumber || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to create appointment: " + error.message);
      setLoading(false);
      return;
    }

    // Update series current_session if linked
    if (seriesId && sessionNumber) {
      await supabase
        .from("series")
        .update({ current_session: sessionNumber })
        .eq("id", seriesId);
    }

    toast.success("Appointment created");
    onOpenChange(false);
    setLoading(false);
    router.refresh();
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`;
  }

  // Default to tomorrow at 10am
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Schedule — {client.first_name} {client.last_name}
          </DialogTitle>
          <DialogDescription>
            Book a new session for this client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.duration_minutes} min
                    {t.price_cents > 0
                      ? ` \u2014 ${formatPrice(t.price_cents)}`
                      : " \u2014 Free"}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Series info */}
          {isSeriesType && activeSeries && useSeriesLink && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Ten Series — Session</Label>
                <Select
                  value={String(sessionNumber || activeSeries.current_session + 1)}
                  onValueChange={(val) => setSessionNumber(Number(val))}
                >
                  <SelectTrigger className="w-16 h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: activeSeries.total_sessions },
                      (_, i) => i + 1
                    ).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  of {activeSeries.total_sessions}
                </span>
              </div>
              {sessionNumber && <SessionGuidePreview sessionNumber={sessionNumber} />}
            </div>
          )}

          {isSeriesType && !activeSeries && (
            <p className="text-sm text-muted-foreground rounded-lg border p-3">
              No active Ten Series. This will be a standalone session.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qb-date">Date</Label>
              <Input
                id="qb-date"
                name="date"
                type="date"
                required
                className="input-premium"
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qb-time">Time</Label>
              <Input
                id="qb-time"
                name="time"
                type="time"
                required
                className="input-premium"
                defaultValue="10:00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qb-notes">Notes</Label>
            <Textarea
              id="qb-notes"
              name="notes"
              rows={2}
              className="input-premium"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedType}>
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
