"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TimeBlock } from "@/types";

interface TimeBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultEndTime?: string;
  editingBlock?: TimeBlock;
}

export function TimeBlockDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultTime,
  defaultEndTime,
  editingBlock,
}: TimeBlockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Reset toggles when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAllDay(false);
      setMultiDay(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const endDate = formData.get("end_date") as string;
    const notes = formData.get("notes") as string;

    // Validate multi-day range
    if (multiDay && !editingBlock) {
      if (!endDate || endDate < date) {
        toast.error("End date must be on or after the start date");
        setLoading(false);
        return;
      }
    }

    let startTime: string | undefined;
    let endTime: string | undefined;

    if (!allDay) {
      startTime = formData.get("start_time") as string;
      endTime = formData.get("end_time") as string;

      if (new Date(`${date}T${endTime}`) <= new Date(`${date}T${startTime}`)) {
        toast.error("End time must be after start time");
        setLoading(false);
        return;
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    if (editingBlock) {
      const startsAt = allDay
        ? new Date(`${date}T00:00`)
        : new Date(`${date}T${startTime}`);
      const endsAt = allDay
        ? new Date(`${date}T23:59`)
        : new Date(`${date}T${endTime}`);

      const { error } = await supabase
        .from("time_blocks")
        .update({
          title,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          notes: notes || null,
        })
        .eq("id", editingBlock.id);

      if (error) {
        toast.error("Failed to update time block: " + error.message);
        setLoading(false);
        return;
      }
      toast.success("Time block updated");
    } else if (multiDay) {
      // Build one row per day in the range
      const rows: {
        practitioner_id: string;
        title: string;
        starts_at: string;
        ends_at: string;
        notes: string | null;
      }[] = [];
      const current = new Date(`${date}T00:00`);
      const last = new Date(`${endDate}T00:00`);

      while (current <= last) {
        const dayStr = current.toISOString().split("T")[0];
        const dayStart = allDay
          ? new Date(`${dayStr}T00:00`)
          : new Date(`${dayStr}T${startTime}`);
        const dayEnd = allDay
          ? new Date(`${dayStr}T23:59`)
          : new Date(`${dayStr}T${endTime}`);

        rows.push({
          practitioner_id: user.id,
          title,
          starts_at: dayStart.toISOString(),
          ends_at: dayEnd.toISOString(),
          notes: notes || null,
        });
        current.setDate(current.getDate() + 1);
      }

      const { error } = await supabase.from("time_blocks").insert(rows);

      if (error) {
        toast.error("Failed to create time blocks: " + error.message);
        setLoading(false);
        return;
      }
      toast.success(`${rows.length} time block${rows.length > 1 ? "s" : ""} created`);
    } else {
      const startsAt = allDay
        ? new Date(`${date}T00:00`)
        : new Date(`${date}T${startTime}`);
      const endsAt = allDay
        ? new Date(`${date}T23:59`)
        : new Date(`${date}T${endTime}`);

      const { error } = await supabase.from("time_blocks").insert({
        practitioner_id: user.id,
        title,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        notes: notes || null,
      });

      if (error) {
        toast.error("Failed to create time block: " + error.message);
        setLoading(false);
        return;
      }
      toast.success("Time block created");
    }

    onOpenChange(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingBlock) return;
    setLoading(true);

    const { error } = await supabase
      .from("time_blocks")
      .delete()
      .eq("id", editingBlock.id);

    if (error) {
      toast.error("Failed to delete time block: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Time block deleted");
    onOpenChange(false);
    setLoading(false);
    router.refresh();
  }

  const editDate = editingBlock
    ? new Date(editingBlock.starts_at).toISOString().split("T")[0]
    : undefined;
  const editStartTime = editingBlock
    ? new Date(editingBlock.starts_at).toLocaleTimeString("en-CA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : undefined;
  const editEndTime = editingBlock
    ? new Date(editingBlock.ends_at).toLocaleTimeString("en-CA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editingBlock ? "Edit Time Block" : "Block Time"}
          </DialogTitle>
          <DialogDescription>
            {editingBlock
              ? "Update or remove this blocked time."
              : "Mark a time period as unavailable."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. Lunch, Personal, Training"
              className="input-premium"
              defaultValue={editingBlock?.title}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label htmlFor="block-date">{multiDay && !editingBlock ? "Start Date" : "Date"}</Label>
              <Input
                id="block-date"
                name="date"
                type="date"
                required
                className="input-premium"
                defaultValue={editDate || defaultDate}
              />
            </div>
            <div className="flex flex-col gap-2 ml-4 pt-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="all-day"
                  checked={allDay}
                  onCheckedChange={setAllDay}
                />
                <Label htmlFor="all-day" className="text-sm cursor-pointer">
                  All day
                </Label>
              </div>
              {!editingBlock && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="multi-day"
                    checked={multiDay}
                    onCheckedChange={setMultiDay}
                  />
                  <Label htmlFor="multi-day" className="text-sm cursor-pointer">
                    Multi-day
                  </Label>
                </div>
              )}
            </div>
          </div>
          {multiDay && !editingBlock && (
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                name="end_date"
                type="date"
                required
                className="input-premium"
                defaultValue={defaultDate}
              />
            </div>
          )}
          {!allDay && <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                required
                className="input-premium"
                defaultValue={editStartTime || defaultTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                required
                className="input-premium"
                defaultValue={
                  editEndTime ||
                  defaultEndTime ||
                  (defaultTime
                    ? `${String(parseInt(defaultTime.split(":")[0]) + 1).padStart(2, "0")}:${defaultTime.split(":")[1]}`
                    : undefined)
                }
              />
            </div>
          </div>}
          <div className="space-y-2">
            <Label htmlFor="block-notes">Notes</Label>
            <Textarea
              id="block-notes"
              name="notes"
              rows={2}
              className="input-premium"
              defaultValue={editingBlock?.notes || ""}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {editingBlock && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="sm:mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? editingBlock
                  ? "Updating..."
                  : "Creating..."
                : editingBlock
                  ? "Update"
                  : "Block Time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
