"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BodyMapSvg } from "@/components/clients/detail/body-map-svg";
import { BodyMapDrawingLayer } from "./body-map-drawing-layer";
import { DrawingToolbar, type DrawingTool } from "./drawing-toolbar";
import type { BodyRegion, FocusArea, BodyMapDrawing } from "@/types";

interface BodyMapEditorProps {
  focusAreas: FocusArea[];
  onToggleRegion: (region: BodyRegion) => void;
  drawings: BodyMapDrawing[];
  onDrawingsChange: (drawings: BodyMapDrawing[]) => void;
}

export function BodyMapEditor({
  focusAreas,
  onToggleRegion,
  drawings,
  onDrawingsChange,
}: BodyMapEditorProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [activeTool, setActiveTool] = useState<DrawingTool | null>(null);
  const [activeColor, setActiveColor] = useState("#ef4444");

  const selectedAreas = new Set(focusAreas.map((fa) => fa.area));

  // Build region intensity from focus areas (binary: selected or not)
  const regionIntensity: Partial<Record<BodyRegion, number>> = {};
  for (const fa of focusAreas) {
    regionIntensity[fa.area as BodyRegion] = 0.6;
  }

  function handleRegionClick(region: BodyRegion) {
    if (activeTool) return; // Don't toggle regions while drawing
    onToggleRegion(region);
  }

  function handleAddDrawing(drawing: BodyMapDrawing) {
    onDrawingsChange([...drawings, drawing]);
  }

  function handleRemoveDrawing(index: number) {
    onDrawingsChange(drawings.filter((_, i) => i !== index));
  }

  function handleUndo() {
    // Remove the last drawing for the current view
    const lastIdx = drawings.findLastIndex((d) => d.view === view);
    if (lastIdx >= 0) {
      onDrawingsChange(drawings.filter((_, i) => i !== lastIdx));
    }
  }

  const canUndo = drawings.some((d) => d.view === view);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Body Map</label>
        <div className="flex gap-1">
          <Button
            variant={view === "front" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setView("front")}
          >
            Front
          </Button>
          <Button
            variant={view === "back" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setView("back")}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Drawing toolbar */}
      <DrawingToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onUndo={handleUndo}
        canUndo={canUndo}
      />

      {/* Body map with drawing overlay */}
      <div className="relative flex justify-center">
        <div className="relative w-full max-w-[200px]">
          <BodyMapSvg
            view={view}
            regionIntensity={regionIntensity}
            selectedRegion={null}
            onRegionClick={handleRegionClick}
            onRegionHover={() => {}}
          />
          <BodyMapDrawingLayer
            drawings={drawings}
            view={view}
            activeTool={activeTool}
            activeColor={activeColor}
            onAddDrawing={handleAddDrawing}
            onRemoveDrawing={handleRemoveDrawing}
          />
        </div>
      </div>

      {selectedAreas.size > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          {selectedAreas.size} area{selectedAreas.size !== 1 ? "s" : ""} selected — click regions to toggle
        </p>
      )}
    </div>
  );
}
