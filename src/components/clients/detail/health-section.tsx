"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, AlertTriangle, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Client, HealthHistory, EmergencyContact } from "@/types";

interface HealthSectionProps {
  client: Client;
  onClientUpdate?: (updated: Client) => void;
}

export function HealthSection({ client, onClientUpdate }: HealthSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const health = client.health_history;
  const emergency = client.emergency_contact;

  const [form, setForm] = useState<HealthHistory>({
    conditions: health?.conditions || [],
    medications: health?.medications || [],
    surgeries: health?.surgeries || [],
    allergies: health?.allergies || [],
    previous_bodywork: health?.previous_bodywork || [],
    current_complaints: health?.current_complaints || "",
    goals: health?.goals || "",
  });
  const [emergencyForm, setEmergencyForm] = useState<EmergencyContact>({
    name: emergency?.name || "",
    phone: emergency?.phone || "",
    relationship: emergency?.relationship || "",
  });

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clients")
      .update({
        health_history: form,
        emergency_contact: emergencyForm,
      })
      .eq("id", client.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Health information saved");
      onClientUpdate?.(data);
      setEditing(false);
    }
    setSaving(false);
  }

  function handleArrayField(
    field: keyof Pick<HealthHistory, "conditions" | "medications" | "surgeries" | "allergies" | "previous_bodywork">,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  }

  if (editing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading">Health Information</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Conditions</label>
              <Input
                value={form.conditions.join(", ")}
                onChange={(e) => handleArrayField("conditions", e.target.value)}
                placeholder="Comma separated..."
                className="input-premium text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Medications</label>
              <Input
                value={form.medications.join(", ")}
                onChange={(e) => handleArrayField("medications", e.target.value)}
                placeholder="Comma separated..."
                className="input-premium text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Allergies</label>
              <Input
                value={form.allergies.join(", ")}
                onChange={(e) => handleArrayField("allergies", e.target.value)}
                placeholder="Comma separated..."
                className="input-premium text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Surgeries</label>
              <Input
                value={form.surgeries.join(", ")}
                onChange={(e) => handleArrayField("surgeries", e.target.value)}
                placeholder="Comma separated..."
                className="input-premium text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Previous Bodywork</label>
              <Input
                value={form.previous_bodywork.join(", ")}
                onChange={(e) => handleArrayField("previous_bodywork", e.target.value)}
                placeholder="Comma separated..."
                className="input-premium text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Current Complaints</label>
            <Textarea
              value={form.current_complaints}
              onChange={(e) => setForm((f) => ({ ...f, current_complaints: e.target.value }))}
              rows={2}
              className="input-premium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Goals</label>
            <Textarea
              value={form.goals}
              onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
              rows={2}
              className="input-premium text-sm"
            />
          </div>
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Emergency Contact</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Name"
                value={emergencyForm.name}
                onChange={(e) => setEmergencyForm((f) => ({ ...f, name: e.target.value }))}
                className="input-premium text-sm"
              />
              <Input
                placeholder="Phone"
                value={emergencyForm.phone}
                onChange={(e) => setEmergencyForm((f) => ({ ...f, phone: e.target.value }))}
                className="input-premium text-sm"
              />
              <Input
                placeholder="Relationship"
                value={emergencyForm.relationship}
                onChange={(e) => setEmergencyForm((f) => ({ ...f, relationship: e.target.value }))}
                className="input-premium text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading">Health Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!health && !emergency ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No health information recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {health && (
              <div className="grid gap-4 sm:grid-cols-2">
                {health.conditions && health.conditions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {health.conditions.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {health.medications && health.medications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Medications</p>
                    <div className="flex flex-wrap gap-1">
                      {health.medications.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {health.allergies && health.allergies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {health.allergies.map((a) => (
                        <Badge key={a} variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />{a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {health.surgeries && health.surgeries.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Surgeries</p>
                    <div className="flex flex-wrap gap-1">
                      {health.surgeries.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {health.previous_bodywork && health.previous_bodywork.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Previous Bodywork</p>
                    <div className="flex flex-wrap gap-1">
                      {health.previous_bodywork.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {health.current_complaints && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Complaints</p>
                    <p className="text-sm">{health.current_complaints}</p>
                  </div>
                )}
                {health.goals && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Goals</p>
                    <p className="text-sm">{health.goals}</p>
                  </div>
                )}
              </div>
            )}
            {emergency && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Emergency Contact</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{emergency.name}</span>
                  <span className="text-muted-foreground">({emergency.relationship})</span>
                  <a
                    href={`tel:${emergency.phone}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {emergency.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
