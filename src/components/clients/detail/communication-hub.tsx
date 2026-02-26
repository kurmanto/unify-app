"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Bell, FileText, MessageSquare, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { ClientCommunication } from "@/types";

interface CommunicationHubProps {
  clientId: string;
  clientEmail: string;
  intakeCompleted: boolean;
}

export function CommunicationHub({
  clientId,
  clientEmail,
  intakeCompleted,
}: CommunicationHubProps) {
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const supabase = createClient();

  const loadCommunications = useCallback(async () => {
    const { data } = await supabase
      .from("client_communications")
      .select("*")
      .eq("client_id", clientId)
      .order("sent_at", { ascending: false })
      .limit(10);
    setCommunications((data as ClientCommunication[]) || []);
    setLoading(false);
  }, [clientId, supabase]);

  useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  async function sendCommunication(type: "reminder" | "intake_request" | "follow_up") {
    setSending(type);
    try {
      const response = await fetch(`/api/clients/${clientId}/communicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send");
      }

      toast.success("Email sent successfully");
      loadCommunications();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      );
    }
    setSending(null);
  }

  const typeIcons: Record<string, typeof Mail> = {
    email: Mail,
    reminder: Bell,
    intake_request: FileText,
    follow_up: MessageSquare,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading">Communications</CardTitle>
          <span className="text-xs text-muted-foreground">{clientEmail}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendCommunication("reminder")}
            disabled={sending !== null}
          >
            {sending === "reminder" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Bell className="h-3.5 w-3.5 mr-1" />
            )}
            Send Reminder
          </Button>
          {!intakeCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendCommunication("intake_request")}
              disabled={sending !== null}
            >
              {sending === "intake_request" ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 mr-1" />
              )}
              Send Intake Form
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendCommunication("follow_up")}
            disabled={sending !== null}
          >
            {sending === "follow_up" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
            )}
            Follow-up
          </Button>
        </div>

        {/* Recent communications */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : communications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No communications sent yet.
          </p>
        ) : (
          <div className="space-y-2">
            {communications.map((comm) => {
              const Icon = typeIcons[comm.type] || Mail;
              return (
                <div
                  key={comm.id}
                  className="flex items-start gap-3 rounded-lg border p-2.5"
                >
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{comm.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comm.sent_at).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      comm.status === "sent" || comm.status === "delivered"
                        ? "badge-completed"
                        : comm.status === "opened"
                        ? "badge-confirmed"
                        : "badge-cancelled"
                    }`}
                  >
                    {comm.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
