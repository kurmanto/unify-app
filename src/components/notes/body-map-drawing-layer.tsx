"use client";

import { useRef, useState, useCallback } from "react";
import type { BodyMapDrawing } from "@/types";
import type { DrawingTool } from "./drawing-toolbar";

interface BodyMapDrawingLayerProps {
  drawings: BodyMapDrawing[];
  view: "front" | "back";
  activeTool: DrawingTool | null;
  activeColor: string;
  onAddDrawing: (drawing: BodyMapDrawing) => void;
  onRemoveDrawing: (index: number) => void;
}

export function BodyMapDrawingLayer({
  drawings,
  view,
  activeTool,
  activeColor,
  onAddDrawing,
  onRemoveDrawing,
}: BodyMapDrawingLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);

  const viewDrawings = drawings.filter((d) => d.view === view);

  function getSvgPoint(e: React.PointerEvent): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 360;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!activeTool) return;
    e.preventDefault();

    const pt = getSvgPoint(e);

    if (activeTool === "pen") {
      setIsDrawing(true);
      setCurrentPath([`M${pt.x} ${pt.y}`]);
      (e.target as Element).setPointerCapture(e.pointerId);
    } else if (activeTool === "arrow") {
      if (!arrowStart) {
        setArrowStart(pt);
      } else {
        const d = `M${arrowStart.x} ${arrowStart.y} L${pt.x} ${pt.y}`;
        onAddDrawing({
          type: "arrow",
          d,
          color: activeColor,
          strokeWidth: 2,
          view,
        });
        setArrowStart(null);
      }
    } else if (activeTool === "eraser") {
      // Find nearest drawing to click point and remove it
      const threshold = 15;
      let closestIdx = -1;
      let closestDist = Infinity;

      viewDrawings.forEach((drawing, i) => {
        const dist = distanceToPath(drawing.d, pt);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      if (closestIdx >= 0 && closestDist < threshold) {
        // Find the index in the full drawings array
        const globalIdx = drawings.indexOf(viewDrawings[closestIdx]);
        if (globalIdx >= 0) onRemoveDrawing(globalIdx);
      }
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDrawing || activeTool !== "pen") return;
    const pt = getSvgPoint(e);
    setCurrentPath((prev) => [...prev, `L${pt.x} ${pt.y}`]);
  }

  function handlePointerUp() {
    if (!isDrawing || activeTool !== "pen") return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      onAddDrawing({
        type: "path",
        d: currentPath.join(" "),
        color: activeColor,
        strokeWidth: 2,
        view,
      });
    }
    setCurrentPath([]);
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 360"
      className="absolute inset-0 w-full h-full"
      style={{
        cursor: activeTool
          ? activeTool === "eraser"
            ? "crosshair"
            : "crosshair"
          : "default",
        pointerEvents: activeTool ? "auto" : "none",
        touchAction: activeTool ? "none" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
        </marker>
      </defs>

      {/* Rendered drawings */}
      {viewDrawings.map((drawing, i) => (
        <path
          key={i}
          d={drawing.d}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={drawing.type === "arrow" ? "url(#arrowhead)" : undefined}
          style={drawing.type === "arrow" ? { color: drawing.color } : undefined}
        />
      ))}

      {/* Current drawing in progress */}
      {currentPath.length > 0 && (
        <path
          d={currentPath.join(" ")}
          stroke={activeColor}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Arrow start indicator */}
      {arrowStart && (
        <circle
          cx={arrowStart.x}
          cy={arrowStart.y}
          r={3}
          fill={activeColor}
          opacity={0.5}
        />
      )}
    </svg>
  );
}

function distanceToPath(d: string, point: { x: number; y: number }): number {
  // Parse path to get points and compute min distance
  const coords: { x: number; y: number }[] = [];
  const parts = d.match(/[ML]\s*[\d.]+\s+[\d.]+/g);
  if (!parts) return Infinity;

  for (const part of parts) {
    const nums = part.match(/[\d.]+/g);
    if (nums && nums.length >= 2) {
      coords.push({ x: parseFloat(nums[0]), y: parseFloat(nums[1]) });
    }
  }

  if (coords.length === 0) return Infinity;

  let minDist = Infinity;
  for (const c of coords) {
    const dx = c.x - point.x;
    const dy = c.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) minDist = dist;
  }

  // Also check midpoints of segments for better hit detection
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const dist = pointToSegmentDist(point, a, b);
    if (dist < minDist) minDist = dist;
  }

  return minDist;
}

function pointToSegmentDist(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}
