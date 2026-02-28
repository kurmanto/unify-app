"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { TECHNIQUES, getCategories } from "@/lib/rolfing/techniques";
import { Plus, X } from "lucide-react";

interface TechniqueSelectorProps {
  selected: string[];
  onChange: (techniques: string[]) => void;
}

export function TechniqueSelector({ selected, onChange }: TechniqueSelectorProps) {
  const [open, setOpen] = useState(false);
  const categories = getCategories();

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  function remove(name: string) {
    onChange(selected.filter((t) => t !== name));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Techniques Used</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <div className="max-h-72 overflow-y-auto p-3 space-y-3">
              {categories.map((category) => (
                <div key={category}>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {TECHNIQUES.filter((t) => t.category === category).map(
                      (tech) => (
                        <label
                          key={tech.name}
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md px-1.5 py-1 -mx-1.5"
                        >
                          <Checkbox
                            checked={selected.includes(tech.name)}
                            onCheckedChange={() => toggle(tech.name)}
                          />
                          <span className="text-sm">{tech.name}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(name)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No techniques selected
        </p>
      )}
    </div>
  );
}
