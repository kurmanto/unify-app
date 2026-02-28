"use client";

import { Button } from "@/components/ui/button";
import { Pencil, ArrowUpRight, Eraser, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawingTool = "pen" | "arrow" | "eraser";

const COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#1f2937", label: "Black" },
];

interface DrawingToolbarProps {
  activeTool: DrawingTool | null;
  activeColor: string;
  onToolChange: (tool: DrawingTool | null) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function DrawingToolbar({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
  onUndo,
  canUndo,
}: DrawingToolbarProps) {
  function toggleTool(tool: DrawingTool) {
    onToolChange(activeTool === tool ? null : tool);
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Button
        variant={activeTool === "pen" ? "default" : "outline"}
        size="icon"
        className="h-7 w-7"
        onClick={() => toggleTool("pen")}
        title="Pen"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={activeTool === "arrow" ? "default" : "outline"}
        size="icon"
        className="h-7 w-7"
        onClick={() => toggleTool("arrow")}
        title="Arrow"
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={activeTool === "eraser" ? "default" : "outline"}
        size="icon"
        className="h-7 w-7"
        onClick={() => toggleTool("eraser")}
        title="Eraser"
      >
        <Eraser className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-5 bg-border mx-0.5" />

      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onColorChange(c.value)}
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-transform",
            activeColor === c.value
              ? "border-foreground scale-110"
              : "border-transparent hover:scale-105"
          )}
          style={{ backgroundColor: c.value }}
        />
      ))}

      <div className="w-px h-5 bg-border mx-0.5" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
