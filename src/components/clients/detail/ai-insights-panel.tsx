"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingUp,
  Target,
  Brain,
} from "lucide-react";
import type { ClientInsights } from "@/types";

interface AiInsightsPanelProps {
  clientId: string;
  hasSoapNotes: boolean;
}

export function AiInsightsPanel({ clientId, hasSoapNotes }: AiInsightsPanelProps) {
  const [insights, setInsights] = useState<ClientInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/client-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load insights");
      }

      const data = await response.json();
      setInsights(data);
      setLastGenerated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (hasSoapNotes) {
      loadInsights();
    }
  }, [hasSoapNotes, loadInsights]);

  if (!hasSoapNotes) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-heading">AI Insights</CardTitle>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="flex items-center gap-2">
            {lastGenerated && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(lastGenerated).toLocaleTimeString("en-CA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadInsights}
              disabled={loading}
              className="h-7"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {loading && !insights && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing treatment history...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {insights && (
            <>
              {/* Pre-session briefing */}
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pre-Session Briefing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insights.pre_session_briefing}
                </p>
              </div>

              {/* Recommendations */}
              {insights.next_session_recommendations.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-sm font-medium">Next Session Recommendations</span>
                  </div>
                  <ul className="space-y-1 ml-5">
                    {insights.next_session_recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground list-disc">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment patterns */}
              {insights.treatment_patterns.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-sm font-medium">Treatment Patterns</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.treatment_patterns.map((pattern, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress summary */}
              {insights.progress_summary && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Progress</span>
                  <p className="text-sm text-muted-foreground">
                    {insights.progress_summary}
                  </p>
                </div>
              )}

              {/* Areas of concern */}
              {insights.areas_of_concern.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-sm font-medium">Areas of Concern</span>
                  </div>
                  <ul className="space-y-1 ml-5">
                    {insights.areas_of_concern.map((concern, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-700 list-disc"
                      >
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
