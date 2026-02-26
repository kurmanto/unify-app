"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewSwitcherProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-lg border p-0.5">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          view === "grid" && "bg-accent"
        )}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          view === "table" && "bg-accent"
        )}
        onClick={() => onViewChange("table")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
