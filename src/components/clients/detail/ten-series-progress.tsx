"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEN_SERIES, getPhaseLabel, type TenSeriesSession } from "@/lib/rolfing/ten-series";
import type { Series, SoapNote } from "@/types";

interface TenSeriesProgressProps {
  series: Series;
  soapNotes: SoapNote[];
  onSessionClick?: (sessionNumber: number) => void;
}

function getNodeColor(phase: TenSeriesSession["phase"], completed: boolean, current: boolean) {
  const base = {
    sleeve: {
      bg: completed ? "bg-blue-500" : current ? "bg-blue-500/30 ring-2 ring-blue-500" : "bg-blue-500/10",
      text: completed ? "text-white" : current ? "text-blue-700" : "text-blue-400",
      bar: "bg-blue-500",
    },
    core: {
      bg: completed ? "bg-amber-500" : current ? "bg-amber-500/30 ring-2 ring-amber-500" : "bg-amber-500/10",
      text: completed ? "text-white" : current ? "text-amber-700" : "text-amber-400",
      bar: "bg-amber-500",
    },
    integration: {
      bg: completed ? "bg-emerald-500" : current ? "bg-emerald-500/30 ring-2 ring-emerald-500" : "bg-emerald-500/10",
      text: completed ? "text-white" : current ? "text-emerald-700" : "text-emerald-400",
      bar: "bg-emerald-500",
    },
  };
  return base[phase];
}

export function TenSeriesProgress({
  series,
  soapNotes: _soapNotes,
  onSessionClick,
}: TenSeriesProgressProps) {
  const currentGuide = TEN_SERIES.find(
    (s) => s.session === series.current_session + 1
  );

  // Group sessions by phase
  const phases = [
    { label: "Sleeve (1-3)", sessions: TEN_SERIES.filter((s) => s.phase === "sleeve") },
    { label: "Core (4-7)", sessions: TEN_SERIES.filter((s) => s.phase === "core") },
    { label: "Integration (8-10)", sessions: TEN_SERIES.filter((s) => s.phase === "integration") },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading">Ten Series Progress</CardTitle>
          <span className="text-xs text-muted-foreground">
            {getPhaseLabel(
              series.current_session <= 3
                ? "sleeve"
                : series.current_session <= 7
                ? "core"
                : "integration"
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase timeline */}
        <div className="flex gap-1">
          {phases.map((phase) => (
            <div key={phase.label} className="flex-1 space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium text-center">
                {phase.label}
              </p>
              <div className="flex gap-1">
                {phase.sessions.map((session) => {
                  const completed = session.session <= series.current_session;
                  const current = session.session === series.current_session + 1;
                  const colors = getNodeColor(session.phase, completed, current);
                  return (
                    <button
                      key={session.session}
                      onClick={() => onSessionClick?.(session.session)}
                      className={cn(
                        "flex-1 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all",
                        colors.bg,
                        colors.text,
                        current && "animate-pulse",
                        "hover:opacity-80 cursor-pointer"
                      )}
                      title={`Session ${session.session}: ${session.name}`}
                    >
                      {session.session}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Current session guide */}
        {currentGuide && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Next: Session {currentGuide.session} — {currentGuide.name}
              </p>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                currentGuide.phase === "sleeve" && "bg-blue-100 text-blue-700",
                currentGuide.phase === "core" && "bg-amber-100 text-amber-700",
                currentGuide.phase === "integration" && "bg-emerald-100 text-emerald-700"
              )}>
                {currentGuide.phase}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{currentGuide.subtitle}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentGuide.focus_areas.map((area) => (
                <span
                  key={area}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
