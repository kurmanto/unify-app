"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CampaignEditorPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const isNew = campaignId === "new";
  const supabase = createClient();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState({
    subject: "",
    body_html: "",
    segment_tags: "",
  });

  useEffect(() => {
    if (!isNew) {
      loadCampaign();
    }
  }, [campaignId]);

  async function loadCampaign() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (data) {
      setCampaign({
        subject: data.subject,
        body_html: data.body_html,
        segment_tags: data.segment_tags.join(", "),
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const payload = {
      practitioner_id: user.id,
      subject: campaign.subject,
      body_html: campaign.body_html,
      segment_tags: campaign.segment_tags
        ? campaign.segment_tags.split(",").map((t) => t.trim())
        : [],
      status: "draft" as const,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("campaigns").insert(payload));
    } else {
      ({ error } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", campaignId));
    }

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Campaign saved");
      router.push("/campaigns");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "New Campaign" : "Edit Campaign"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button variant="outline" disabled>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={campaign.subject}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Your email subject line..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body (HTML)</Label>
                <Textarea
                  id="body"
                  value={campaign.body_html}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      body_html: e.target.value,
                    }))
                  }
                  rows={15}
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Segment Tags (comma-separated)</Label>
                <Input
                  value={campaign.segment_tags}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      segment_tags: e.target.value,
                    }))
                  }
                  placeholder="ten-series, active, new-client"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send to all clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
