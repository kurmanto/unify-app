"use client";

import type { BodyRegion } from "@/types";

interface BodyMapSvgProps {
  view: "front" | "back";
  regionIntensity: Partial<Record<BodyRegion, number>>;
  selectedRegion: BodyRegion | null;
  onRegionClick: (region: BodyRegion) => void;
  onRegionHover: (region: BodyRegion | null) => void;
}

interface RegionPath {
  region: BodyRegion;
  label: string;
  views: ("front" | "back")[];
  // Simple rectangle-based positioning (x, y, width, height) in a 200x400 coordinate space
  x: number;
  y: number;
  w: number;
  h: number;
}

const REGIONS: RegionPath[] = [
  // Head & neck
  { region: "head", label: "Head", views: ["front", "back"], x: 80, y: 5, w: 40, h: 35 },
  { region: "jaw", label: "Jaw", views: ["front"], x: 82, y: 30, w: 36, h: 15 },
  { region: "neck", label: "Neck", views: ["front", "back"], x: 85, y: 42, w: 30, h: 20 },
  // Shoulders & arms
  { region: "shoulders", label: "Shoulders", views: ["front", "back"], x: 50, y: 60, w: 100, h: 20 },
  { region: "arms", label: "Arms", views: ["front", "back"], x: 30, y: 80, w: 25, h: 60 },
  { region: "arms", label: "Arms R", views: ["front", "back"], x: 145, y: 80, w: 25, h: 60 },
  { region: "forearms", label: "Forearms", views: ["front", "back"], x: 22, y: 140, w: 22, h: 50 },
  { region: "forearms", label: "Forearms R", views: ["front", "back"], x: 156, y: 140, w: 22, h: 50 },
  { region: "hands", label: "Hands", views: ["front", "back"], x: 18, y: 190, w: 20, h: 30 },
  { region: "hands", label: "Hands R", views: ["front", "back"], x: 162, y: 190, w: 20, h: 30 },
  // Torso front
  { region: "chest", label: "Chest", views: ["front"], x: 60, y: 80, w: 80, h: 40 },
  { region: "abdomen", label: "Abdomen", views: ["front"], x: 65, y: 120, w: 70, h: 40 },
  // Torso back
  { region: "upper_back", label: "Upper Back", views: ["back"], x: 60, y: 80, w: 80, h: 30 },
  { region: "mid_back", label: "Mid Back", views: ["back"], x: 62, y: 110, w: 76, h: 25 },
  { region: "lower_back", label: "Lower Back", views: ["back"], x: 65, y: 135, w: 70, h: 25 },
  // Side body
  { region: "side_body", label: "Side", views: ["front", "back"], x: 52, y: 85, w: 12, h: 70 },
  { region: "side_body", label: "Side R", views: ["front", "back"], x: 136, y: 85, w: 12, h: 70 },
  // Pelvis & hips
  { region: "pelvis", label: "Pelvis", views: ["front"], x: 68, y: 160, w: 64, h: 20 },
  { region: "hips", label: "Hips", views: ["front", "back"], x: 55, y: 155, w: 15, h: 25 },
  { region: "hips", label: "Hips R", views: ["front", "back"], x: 130, y: 155, w: 15, h: 25 },
  { region: "sacrum", label: "Sacrum", views: ["back"], x: 80, y: 157, w: 40, h: 22 },
  { region: "glutes", label: "Glutes", views: ["back"], x: 65, y: 160, w: 70, h: 28 },
  // Upper legs
  { region: "upper_legs", label: "Thigh L", views: ["front", "back"], x: 65, y: 185, w: 30, h: 55 },
  { region: "upper_legs", label: "Thigh R", views: ["front", "back"], x: 105, y: 185, w: 30, h: 55 },
  { region: "inner_legs", label: "Inner L", views: ["front"], x: 90, y: 190, w: 12, h: 45 },
  { region: "inner_legs", label: "Inner R", views: ["front"], x: 98, y: 190, w: 12, h: 45 },
  { region: "it_band", label: "IT Band L", views: ["front", "back"], x: 58, y: 185, w: 10, h: 50 },
  { region: "it_band", label: "IT Band R", views: ["front", "back"], x: 132, y: 185, w: 10, h: 50 },
  // Knees
  { region: "knees", label: "Knee L", views: ["front", "back"], x: 68, y: 240, w: 24, h: 18 },
  { region: "knees", label: "Knee R", views: ["front", "back"], x: 108, y: 240, w: 24, h: 18 },
  // Lower legs
  { region: "lower_legs", label: "Calf L", views: ["front", "back"], x: 70, y: 258, w: 22, h: 55 },
  { region: "lower_legs", label: "Calf R", views: ["front", "back"], x: 108, y: 258, w: 22, h: 55 },
  // Ankles
  { region: "ankles", label: "Ankle L", views: ["front", "back"], x: 70, y: 315, w: 22, h: 15 },
  { region: "ankles", label: "Ankle R", views: ["front", "back"], x: 108, y: 315, w: 22, h: 15 },
  // Feet
  { region: "feet", label: "Foot L", views: ["front", "back"], x: 66, y: 330, w: 28, h: 20 },
  { region: "feet", label: "Foot R", views: ["front", "back"], x: 106, y: 330, w: 28, h: 20 },
];

function getRegionFill(
  region: BodyRegion,
  intensity: number | undefined,
  selected: boolean
): string {
  if (selected) return "oklch(0.55 0.12 172 / 60%)";
  if (!intensity || intensity === 0) return "oklch(0.9 0.01 172 / 30%)";

  // Teal scale from light to deep
  const lightness = 0.85 - intensity * 0.35;
  const chroma = 0.03 + intensity * 0.1;
  return `oklch(${lightness} ${chroma} 172 / ${0.3 + intensity * 0.5})`;
}

export function BodyMapSvg({
  view,
  regionIntensity,
  selectedRegion,
  onRegionClick,
  onRegionHover,
}: BodyMapSvgProps) {
  const visibleRegions = REGIONS.filter((r) => r.views.includes(view));

  return (
    <svg viewBox="0 0 200 360" className="w-full max-w-[200px] h-auto">
      {/* Body outline */}
      <ellipse cx="100" cy="25" rx="22" ry="25" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="100" y1="50" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <rect x="58" y="60" width="84" height="100" rx="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <rect x="68" y="160" width="28" height="90" rx="5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <rect x="104" y="160" width="28" height="90" rx="5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <rect x="70" y="250" width="22" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <rect x="108" y="250" width="22" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Interactive regions */}
      {visibleRegions.map((r, i) => {
        const intensity = regionIntensity[r.region];
        const selected = selectedRegion === r.region;

        return (
          <rect
            key={`${r.region}-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx="3"
            fill={getRegionFill(r.region, intensity, selected)}
            stroke={selected ? "oklch(0.45 0.1 172)" : "transparent"}
            strokeWidth={selected ? "1.5" : "0"}
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => onRegionClick(r.region)}
            onMouseEnter={() => onRegionHover(r.region)}
            onMouseLeave={() => onRegionHover(null)}
          >
            <title>{r.label} {intensity ? `(${Math.round(intensity * 100)}% frequency)` : ""}</title>
          </rect>
        );
      })}
    </svg>
  );
}
