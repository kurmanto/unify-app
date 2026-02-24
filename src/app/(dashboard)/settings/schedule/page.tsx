"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { ScheduleConfig, DaySchedule } from "@/types";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const defaultSchedule: ScheduleConfig = {
  days: DAYS.map((_, i) => ({
    day: i,
    enabled: i >= 1 && i <= 5,
    start_time: "09:00",
    end_time: "18:00",
    breaks: [{ start: "12:00", end: "13:00" }],
  })),
  buffer_minutes: 15,
  booking_window_days: 30,
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleConfig>(defaultSchedule);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("practitioners")
      .select("schedule_config")
      .eq("id", user.id)
      .single();

    if (data?.schedule_config) {
      setSchedule(data.schedule_config as ScheduleConfig);
    }
  }

  async function handleSave() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("practitioners")
      .update({ schedule_config: schedule })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Schedule saved");
    }
    setLoading(false);
  }

  function updateDay(index: number, updates: Partial<DaySchedule>) {
    setSchedule((prev) => ({
      ...prev,
      days: prev.days.map((d, i) => (i === index ? { ...d, ...updates } : d)),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Configure your working hours and availability.
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buffer between sessions (minutes)</Label>
              <Input
                type="number"
                value={schedule.buffer_minutes}
                onChange={(e) =>
                  setSchedule((prev) => ({
                    ...prev,
                    buffer_minutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Booking window (days ahead)</Label>
              <Input
                type="number"
                value={schedule.booking_window_days}
                onChange={(e) =>
                  setSchedule((prev) => ({
                    ...prev,
                    booking_window_days: parseInt(e.target.value) || 30,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Hours</CardTitle>
          <CardDescription>
            Set your available hours for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.days.map((day, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="w-28">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) =>
                        updateDay(i, { enabled: checked })
                      }
                    />
                    <span className="text-sm font-medium">{DAYS[i]}</span>
                  </div>
                </div>
                {day.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={day.start_time}
                      onChange={(e) =>
                        updateDay(i, { start_time: e.target.value })
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={day.end_time}
                      onChange={(e) =>
                        updateDay(i, { end_time: e.target.value })
                      }
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
