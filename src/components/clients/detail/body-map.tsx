"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BodyMapSvg } from "./body-map-svg";
import { computeRegionIntensity } from "@/lib/rolfing/body-map-regions";
import type { BodyRegion, SoapNote } from "@/types";

interface BodyMapProps {
  soapNotes: SoapNote[];
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
}

const REGION_LABELS: Partial<Record<BodyRegion, string>> = {
  head: "Head",
  jaw: "Jaw/TMJ",
  neck: "Neck",
  shoulders: "Shoulders",
  chest: "Chest/Ribcage",
  upper_back: "Upper Back",
  mid_back: "Mid Back",
  lower_back: "Lower Back",
  arms: "Arms",
  forearms: "Forearms",
  hands: "Hands",
  abdomen: "Abdomen/Psoas",
  pelvis: "Pelvis",
  hips: "Hips",
  sacrum: "Sacrum/SI",
  glutes: "Glutes",
  upper_legs: "Upper Legs",
  knees: "Knees",
  lower_legs: "Lower Legs",
  ankles: "Ankles",
  feet: "Feet",
  it_band: "IT Band",
  inner_legs: "Inner Legs",
  side_body: "Side Body",
};

export function BodyMap({ soapNotes, selectedRegion, onRegionSelect }: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  const allFocusAreas = useMemo(
    () => soapNotes.flatMap((n) => n.focus_areas || []),
    [soapNotes]
  );

  const regionIntensity = useMemo(
    () => computeRegionIntensity(allFocusAreas),
    [allFocusAreas]
  );

  const activeRegions = Object.entries(regionIntensity)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading">Body Map</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "front" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setView("front")}
            >
              Front
            </Button>
            <Button
              variant={view === "back" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setView("back")}
            >
              Back
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* SVG body map */}
          <div className="flex-1 flex justify-center">
            <BodyMapSvg
              view={view}
              regionIntensity={regionIntensity}
              selectedRegion={selectedRegion as BodyRegion | null}
              onRegionClick={(region) =>
                onRegionSelect(
                  selectedRegion === region ? null : region
                )
              }
              onRegionHover={setHoveredRegion}
            />
          </div>

          {/* Legend & active regions */}
          <div className="w-36 space-y-3">
            {hoveredRegion && (
              <div className="text-xs">
                <p className="font-medium">
                  {REGION_LABELS[hoveredRegion] || hoveredRegion}
                </p>
                <p className="text-muted-foreground">
                  {regionIntensity[hoveredRegion]
                    ? `${Math.round(regionIntensity[hoveredRegion]! * 100)}% frequency`
                    : "Not worked"}
                </p>
              </div>
            )}
            {selectedRegion && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs w-full"
                onClick={() => onRegionSelect(null)}
              >
                Clear filter
              </Button>
            )}
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Most Worked
              </p>
              {activeRegions.slice(0, 6).map(([region, intensity]) => (
                <button
                  key={region}
                  onClick={() =>
                    onRegionSelect(
                      selectedRegion === region ? null : region
                    )
                  }
                  className="flex items-center gap-1.5 w-full text-left hover:bg-accent rounded px-1 py-0.5 transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: `oklch(${0.55 - intensity * 0.15} ${0.05 + intensity * 0.08} 172)`,
                    }}
                  />
                  <span className="text-[11px] truncate">
                    {REGION_LABELS[region as BodyRegion] || region}
                  </span>
                </button>
              ))}
              {activeRegions.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  No focus area data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
