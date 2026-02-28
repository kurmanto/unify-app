"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Brain,
} from "lucide-react";
import type { PreSessionBriefing } from "@/types";

interface PreSessionBriefingPanelProps {
  appointmentId: string;
}

export function PreSessionBriefingPanel({
  appointmentId,
}: PreSessionBriefingPanelProps) {
  const [briefing, setBriefing] = useState<PreSessionBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch("/api/notes/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appointmentId }),
        });
        if (res.ok) {
          setBriefing(await res.json());
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBriefing();
  }, [appointmentId]);

  if (error || (!loading && !briefing)) return null;

  const hasBriefingContent =
    briefing &&
    (briefing.ai_briefing ||
      briefing.last_session_plan ||
      briefing.ten_series_guide ||
      briefing.follow_up_areas.length > 0);

  if (!loading && !hasBriefingContent) return null;

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Pre-Session Briefing</span>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && !loading && briefing && (
        <div className="px-3 pb-3 space-y-3">
          <Separator />

          {/* AI briefing */}
          {briefing.ai_briefing && (
            <div className="rounded-md bg-primary/5 border border-primary/10 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
                <Sparkles className="h-3 w-3" />
                AI Summary
              </div>
              <p className="text-sm">{briefing.ai_briefing}</p>
            </div>
          )}

          {/* Last session plan */}
          {briefing.last_session_plan && (
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                Last Session Plan
              </h4>
              <p className="text-sm">{briefing.last_session_plan}</p>
            </div>
          )}

          {/* Follow-up areas */}
          {briefing.follow_up_areas.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                Follow-Up Areas
              </h4>
              <div className="flex flex-wrap gap-1">
                {briefing.follow_up_areas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ten Series guide */}
          {briefing.ten_series_guide && (
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                Session {briefing.ten_series_guide.session}:{" "}
                {briefing.ten_series_guide.name}
              </h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {briefing.ten_series_guide.goals.map((goal) => (
                    <Badge
                      key={goal}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {briefing.ten_series_guide.philosophy}
                </p>
              </div>
            </div>
          )}

          {/* Recommended techniques */}
          {briefing.recommended_techniques.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">
                Suggested Techniques
              </h4>
              <div className="flex flex-wrap gap-1">
                {briefing.recommended_techniques.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
