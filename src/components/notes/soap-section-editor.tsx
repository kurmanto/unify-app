"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AiSuggestionBanner } from "./ai-suggestion-banner";

const SECTION_CONFIG = {
  subjective: {
    label: "Subjective",
    letter: "S",
    color: "text-blue-600 dark:text-blue-400",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    description: "Client's reported symptoms, concerns, and experience",
    prompts: [
      "What did the client report?",
      "Changes since last session?",
      "Pain levels (1-10)?",
      "Response to previous session?",
      "New activities, stress, or injuries?",
    ],
  },
  objective: {
    label: "Objective",
    letter: "O",
    color: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-l-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    description: "Your observations, findings, and measurements",
    prompts: [
      "Postural patterns observed?",
      "Range of motion findings?",
      "Tissue quality & restrictions?",
      "Breathing patterns?",
      "Gait/movement assessment?",
    ],
  },
  assessment: {
    label: "Assessment",
    letter: "A",
    color: "text-amber-600 dark:text-amber-400",
    borderColor: "border-l-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    description: "Clinical interpretation of findings",
    prompts: [
      "Clinical interpretation?",
      "Subjective-objective correlation?",
      "Progress toward goals?",
      "Ten Series session goal alignment?",
    ],
  },
  plan: {
    label: "Plan",
    letter: "P",
    color: "text-purple-600 dark:text-purple-400",
    borderColor: "border-l-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    description: "Treatment plan and follow-up recommendations",
    prompts: [
      "Focus areas for next session?",
      "Home care recommendations?",
      "Session frequency?",
      "Referrals needed?",
      "Goals for next 1-3 sessions?",
    ],
  },
} as const;

type SectionKey = keyof typeof SECTION_CONFIG;

interface SoapSectionEditorProps {
  section: SectionKey;
  value: string;
  onChange: (value: string) => void;
  aiSuggestion?: string | null;
  onAcceptSuggestion?: (text: string) => void;
  onDismissSuggestion?: () => void;
}

export function SoapSectionEditor({
  section,
  value,
  onChange,
  aiSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
}: SoapSectionEditorProps) {
  const [showPrompts, setShowPrompts] = useState(false);
  const config = SECTION_CONFIG[section];

  return (
    <div className={`rounded-lg border-l-[3px] ${config.borderColor} border border-l-[3px] bg-card`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-semibold ${config.color} flex items-center gap-2`}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${config.bgColor}`}>
                {config.letter}
              </span>
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {showPrompts ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Prompts
          </button>
        </div>

        {/* Guided prompts */}
        {showPrompts && (
          <div className={`rounded-md ${config.bgColor} p-2.5`}>
            <ul className="space-y-1">
              {config.prompts.map((prompt) => (
                <li
                  key={prompt}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="text-muted-foreground/60 mt-px">•</span>
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI suggestion */}
        {aiSuggestion && onAcceptSuggestion && onDismissSuggestion && (
          <AiSuggestionBanner
            suggestion={aiSuggestion}
            onAccept={onAcceptSuggestion}
            onDismiss={onDismissSuggestion}
          />
        )}

        {/* Textarea */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={`${config.description}...`}
          className="input-premium resize-none"
        />
      </div>
    </div>
  );
}
