"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle2, Loader2 } from "lucide-react";
import { TemplateSelector } from "./template-selector";
import type { SoapNoteStatus } from "@/types";
import type { SoapTemplate } from "@/lib/rolfing/soap-templates";

interface SoapEditorHeaderProps {
  clientName: string;
  sessionInfo: string;
  status: SoapNoteStatus;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onSave: () => void;
  onComplete: () => void;
  appointmentId: string;
  sessionNumber: number | null;
  onApplyTemplate: (template: SoapTemplate, overwrite: boolean) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function SoapEditorHeader({
  clientName,
  sessionInfo,
  status,
  isSaving,
  lastSavedAt,
  onSave,
  onComplete,
  appointmentId,
  sessionNumber,
  onApplyTemplate,
}: SoapEditorHeaderProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button variant="ghost" size="icon" className="shrink-0" asChild>
        <Link href={`/appointments/${appointmentId}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight font-heading truncate">
            SOAP Note
          </h1>
          <Badge
            variant={status === "complete" ? "default" : "outline"}
            className={
              status === "complete"
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }
          >
            {status === "complete" ? "Complete" : "Draft"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {clientName} — {sessionInfo}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Template selector for Ten Series */}
        <TemplateSelector
          sessionNumber={sessionNumber}
          onApply={onApplyTemplate}
        />

        {/* Auto-save indicator */}
        {isSaving ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        ) : lastSavedAt ? (
          <span className="text-xs text-muted-foreground">
            Saved {timeAgo(lastSavedAt)}
          </span>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Save Draft
        </Button>

        {status !== "complete" && (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isSaving}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
