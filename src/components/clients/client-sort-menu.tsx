"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortField = "name" | "last_visit" | "next_appointment" | "created_at";

interface ClientSortMenuProps {
  value: SortField;
  onChange: (value: SortField) => void;
}

export function ClientSortMenu({ value, onChange }: ClientSortMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as SortField)}>
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="last_visit">Last Visit</SelectItem>
          <SelectItem value="next_appointment">Next Appointment</SelectItem>
          <SelectItem value="created_at">Date Added</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
