"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface SessionGoalsFieldProps {
  goals: string[];
  onChange: (goals: string[]) => void;
}

export function SessionGoalsField({ goals, onChange }: SessionGoalsFieldProps) {
  const [newGoal, setNewGoal] = useState("");

  function addGoal() {
    const trimmed = newGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      onChange([...goals, trimmed]);
      setNewGoal("");
    }
  }

  function removeGoal(index: number) {
    onChange(goals.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Session Goals</label>

      {goals.length > 0 && (
        <ul className="space-y-1">
          {goals.map((goal, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm"
            >
              <span className="flex-1">{goal}</span>
              <button
                type="button"
                onClick={() => removeGoal(i)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-1.5">
        <Input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addGoal();
            }
          }}
          placeholder="Add a goal..."
          className="h-8 text-sm flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={addGoal}
          disabled={!newGoal.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
