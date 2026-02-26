"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ClientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  seriesFilter: string;
  onSeriesFilterChange: (value: string) => void;
  intakeFilter: string;
  onIntakeFilterChange: (value: string) => void;
}

export function ClientFilters({
  search,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  seriesFilter,
  onSeriesFilterChange,
  intakeFilter,
  onIntakeFilterChange,
}: ClientFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 input-premium"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={seriesFilter} onValueChange={onSeriesFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Series status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Series</SelectItem>
            <SelectItem value="active">Active Series</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="none">No Series</SelectItem>
          </SelectContent>
        </Select>
        <Select value={intakeFilter} onValueChange={onIntakeFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Intake status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intake</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors text-xs",
                selectedTags.includes(tag) && "hover:bg-primary/80"
              )}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
