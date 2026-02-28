"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import type { FocusArea, BodyRegion } from "@/types";

const BODY_REGIONS: { group: string; regions: { id: BodyRegion; label: string }[] }[] = [
  {
    group: "Head & Neck",
    regions: [
      { id: "head", label: "Head" },
      { id: "jaw", label: "Jaw" },
      { id: "neck", label: "Neck" },
    ],
  },
  {
    group: "Upper Body",
    regions: [
      { id: "shoulders", label: "Shoulders" },
      { id: "chest", label: "Chest" },
      { id: "arms", label: "Arms" },
      { id: "forearms", label: "Forearms" },
      { id: "hands", label: "Hands" },
    ],
  },
  {
    group: "Torso",
    regions: [
      { id: "upper_back", label: "Upper Back" },
      { id: "mid_back", label: "Mid Back" },
      { id: "lower_back", label: "Lower Back" },
      { id: "abdomen", label: "Abdomen" },
      { id: "side_body", label: "Side Body" },
    ],
  },
  {
    group: "Pelvis & Hips",
    regions: [
      { id: "pelvis", label: "Pelvis" },
      { id: "hips", label: "Hips" },
      { id: "sacrum", label: "Sacrum" },
      { id: "glutes", label: "Glutes" },
    ],
  },
  {
    group: "Lower Body",
    regions: [
      { id: "upper_legs", label: "Upper Legs" },
      { id: "inner_legs", label: "Inner Legs" },
      { id: "it_band", label: "IT Band" },
      { id: "knees", label: "Knees" },
      { id: "lower_legs", label: "Lower Legs" },
      { id: "ankles", label: "Ankles" },
      { id: "feet", label: "Feet" },
    ],
  },
];

interface FocusAreaSelectorProps {
  selected: FocusArea[];
  onChange: (areas: FocusArea[]) => void;
}

export function FocusAreaSelector({ selected, onChange }: FocusAreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedAreas = new Set(selected.map((fa) => fa.area));

  function toggle(region: string) {
    if (selectedAreas.has(region)) {
      onChange(selected.filter((fa) => fa.area !== region));
    } else {
      onChange([...selected, { area: region, notes: "" }]);
    }
  }

  function updateNotes(area: string, notes: string) {
    onChange(
      selected.map((fa) => (fa.area === area ? { ...fa, notes } : fa))
    );
  }

  function remove(area: string) {
    onChange(selected.filter((fa) => fa.area !== area));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Focus Areas</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <div className="max-h-72 overflow-y-auto p-3 space-y-3">
              {BODY_REGIONS.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">
                    {group.group}
                  </p>
                  <div className="space-y-1">
                    {group.regions.map((region) => (
                      <label
                        key={region.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md px-1.5 py-1 -mx-1.5"
                      >
                        <Checkbox
                          checked={selectedAreas.has(region.id)}
                          onCheckedChange={() => toggle(region.id)}
                        />
                        <span className="text-sm">{region.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selected.length > 0 ? (
        <div className="space-y-2">
          {selected.map((fa) => (
            <div
              key={fa.area}
              className="flex items-center gap-2 rounded-md border bg-card p-2"
            >
              <Badge variant="secondary" className="text-xs shrink-0">
                {fa.area.replace(/_/g, " ")}
              </Badge>
              <Input
                value={fa.notes}
                onChange={(e) => updateNotes(fa.area, e.target.value)}
                placeholder="Notes..."
                className="h-7 text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => remove(fa.area)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No focus areas selected
        </p>
      )}
    </div>
  );
}
