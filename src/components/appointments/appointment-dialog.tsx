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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { isSeriesSessionType } from "@/lib/rolfing/ten-series";
import { SessionGuidePreview } from "@/components/appointments/session-guide-preview";

interface ClientOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface SessionTypeOption {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_package: boolean;
}

interface SeriesOption {
  id: string;
  type: string;
  total_sessions: number;
  current_session: number;
  status: string;
}

interface AppointmentDialogProps {
  children?: React.ReactNode;
  defaultDate?: string;
  defaultTime?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AppointmentDialog({
  children,
  defaultDate,
  defaultTime,
  open: controlledOpen,
  onOpenChange,
}: AppointmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (v: boolean) => onOpenChange?.(v)
    : setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeOption[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [clientSeries, setClientSeries] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);
  const [creatingNewSeries, setCreatingNewSeries] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const selectedSessionType = sessionTypes.find((t) => t.id === selectedType);
  const isSeriesType = selectedSessionType
    ? isSeriesSessionType(selectedSessionType.name)
    : false;
  const activeSeries = clientSeries.find((s) => s.status === "active");

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // Reset state when dialog closes
      setSelectedClient("");
      setSelectedType("");
      setClientSeries([]);
      setSelectedSeriesId(null);
      setSessionNumber(null);
      setCreatingNewSeries(false);
    }
  }, [open]);

  // Fetch client's active series when client changes
  useEffect(() => {
    if (selectedClient) {
      loadClientSeries(selectedClient);
    } else {
      setClientSeries([]);
      setSelectedSeriesId(null);
      setSessionNumber(null);
    }
  }, [selectedClient]);

  // Auto-select series and compute session number when series type is selected
  useEffect(() => {
    if (isSeriesType && activeSeries) {
      setSelectedSeriesId(activeSeries.id);
      setSessionNumber(activeSeries.current_session + 1);
      setCreatingNewSeries(false);
    } else if (isSeriesType && !activeSeries) {
      setSelectedSeriesId(null);
      setSessionNumber(null);
    } else {
      setSelectedSeriesId(null);
      setSessionNumber(null);
      setCreatingNewSeries(false);
    }
  }, [isSeriesType, activeSeries?.id]);

  async function loadData() {
    const [{ data: clientsData }, { data: typesData }] = await Promise.all([
      supabase
        .from("clients")
        .select("id, first_name, last_name")
        .order("last_name"),
      supabase
        .from("session_types")
        .select("id, name, duration_minutes, price_cents, is_package")
        .order("name"),
    ]);
    setClients(clientsData || []);
    // Filter out packages — those are not bookable as individual appointments
    setSessionTypes((typesData || []).filter((t: SessionTypeOption) => !t.is_package));
  }

  async function loadClientSeries(clientId: string) {
    const { data } = await supabase
      .from("series")
      .select("id, type, total_sessions, current_session, status")
      .eq("client_id", clientId)
      .eq("status", "active");
    setClientSeries(data || []);
  }

  async function handleStartNewSeries() {
    if (!selectedClient) return;
    setCreatingNewSeries(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setCreatingNewSeries(false);
      return;
    }

    const { data, error } = await supabase
      .from("series")
      .insert({
        client_id: selectedClient,
        practitioner_id: user.id,
        type: "ten_series",
        total_sessions: 10,
        current_session: 0,
        status: "active",
      })
      .select("id, type, total_sessions, current_session, status")
      .single();

    if (error) {
      toast.error("Failed to create series: " + error.message);
      setCreatingNewSeries(false);
      return;
    }

    setClientSeries([data]);
    setSelectedSeriesId(data.id);
    setSessionNumber(1);
    setCreatingNewSeries(false);
    toast.success("New Ten Series started");
  }

  function handleSkipSeries() {
    setSelectedSeriesId(null);
    setSessionNumber(null);
  }

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

    const { error } = await supabase.from("appointments").insert({
      practitioner_id: user.id,
      client_id: selectedClient,
      session_type_id: selectedType,
      series_id: selectedSeriesId || null,
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

    // Update series current_session if linked to a series
    if (selectedSeriesId && sessionNumber) {
      await supabase
        .from("series")
        .update({ current_session: sessionNumber })
        .eq("id", selectedSeriesId);
    }

    toast.success("Appointment created");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new client session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.duration_minutes} min{t.price_cents > 0 ? ` — ${formatPrice(t.price_cents)}` : " — Free"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Series section — shown when a Ten Series session type is selected and a client is chosen */}
          {isSeriesType && selectedClient && (
            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-sm font-medium">Ten Series</Label>
              {activeSeries && selectedSeriesId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Active series — Session {activeSeries.current_session + 1} of{" "}
                    {activeSeries.total_sessions}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipSeries}
                  >
                    Skip series linkage
                  </Button>
                </div>
              ) : activeSeries && !selectedSeriesId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Series linkage skipped.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSeriesId(activeSeries.id);
                      setSessionNumber(activeSeries.current_session + 1);
                    }}
                  >
                    Re-link to active series
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No active Ten Series for this client.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStartNewSeries}
                    disabled={creatingNewSeries}
                  >
                    {creatingNewSeries ? "Creating..." : "Start New Ten Series"}
                  </Button>
                </div>
              )}

              {/* Session guide preview */}
              {sessionNumber && (
                <SessionGuidePreview sessionNumber={sessionNumber} />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required className="input-premium" defaultValue={defaultDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" type="time" required className="input-premium" defaultValue={defaultTime} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} className="input-premium" />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedClient || !selectedType}>
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
