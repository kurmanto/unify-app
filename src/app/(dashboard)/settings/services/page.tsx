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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SessionType {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  tax_rate: number;
  description: string | null;
  is_package: boolean;
  package_sessions: number | null;
  package_price_cents: number | null;
}

export default function ServicesPage() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SessionType | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSessionTypes();
  }, []);

  async function loadSessionTypes() {
    const { data } = await supabase
      .from("session_types")
      .select("*")
      .order("name");
    setSessionTypes(data || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const isPackage = formData.get("is_package") === "on";

    const payload = {
      name: formData.get("name") as string,
      duration_minutes: parseInt(formData.get("duration_minutes") as string),
      price_cents: Math.round(parseFloat(formData.get("price") as string) * 100),
      tax_rate: parseFloat(formData.get("tax_rate") as string),
      description: (formData.get("description") as string) || null,
      is_package: isPackage,
      package_sessions: isPackage
        ? parseInt(formData.get("package_sessions") as string)
        : null,
      package_price_cents: isPackage
        ? Math.round(parseFloat(formData.get("package_price") as string) * 100)
        : null,
    };

    if (editing) {
      const { error } = await supabase
        .from("session_types")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error("Failed to update: " + error.message);
      } else {
        toast.success("Service updated");
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("session_types").insert({
        ...payload,
        practitioner_id: user!.id,
      });
      if (error) {
        toast.error("Failed to create: " + error.message);
      } else {
        toast.success("Service created");
      }
    }

    setDialogOpen(false);
    setEditing(null);
    setLoading(false);
    loadSessionTypes();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("session_types").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Service deleted");
      loadSessionTypes();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Services & Pricing
          </h1>
          <p className="text-muted-foreground">
            Manage your session types and pricing.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Service" : "New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (min)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    defaultValue={editing?.duration_minutes || 90}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={
                      editing ? (editing.price_cents / 100).toFixed(2) : "180.00"
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate</Label>
                <Input
                  id="tax_rate"
                  name="tax_rate"
                  type="number"
                  step="0.0001"
                  defaultValue={editing?.tax_rate || 0.13}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_package"
                  name="is_package"
                  defaultChecked={editing?.is_package}
                />
                <Label htmlFor="is_package">Package deal</Label>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sessionTypes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No services configured yet. Add your first session type.
            </CardContent>
          </Card>
        ) : (
          sessionTypes.map((st) => (
            <Card key={st.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {st.name}
                      {st.is_package && (
                        <Badge variant="secondary" className="ml-2">
                          Package
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{st.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(st);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(st.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <span>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    {st.duration_minutes} min
                  </span>
                  <span>
                    <span className="text-muted-foreground">Price:</span> $
                    {(st.price_cents / 100).toFixed(2)}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Tax:</span>{" "}
                    {(st.tax_rate * 100).toFixed(0)}%
                  </span>
                  {st.is_package && st.package_sessions && (
                    <span>
                      <span className="text-muted-foreground">Sessions:</span>{" "}
                      {st.package_sessions}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
