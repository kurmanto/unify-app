"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Pencil, X } from "lucide-react";

interface AiSuggestionBannerProps {
  suggestion: string;
  onAccept: (text: string) => void;
  onDismiss: () => void;
}

export function AiSuggestionBanner({
  suggestion,
  onAccept,
  onDismiss,
}: AiSuggestionBannerProps) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestion);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        AI Suggestion
      </div>

      {editing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap text-foreground/80">
          {suggestion}
        </p>
      )}

      <div className="flex items-center gap-1.5">
        {editing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                onAccept(editedText);
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setEditing(false);
                setEditedText(suggestion);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={() => onAccept(suggestion)}
            >
              <Check className="h-3 w-3 mr-1" />
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={onDismiss}
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
