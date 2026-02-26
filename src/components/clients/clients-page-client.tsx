"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientDialog } from "./client-dialog";
import { ClientFilters } from "./client-filters";
import { ClientSortMenu, type SortField } from "./client-sort-menu";
import { ViewSwitcher } from "./view-switcher";
import { ClientCard } from "./client-card";
import { ClientTableRow } from "./client-table-row";
import type { ClientListItem } from "@/types";

interface ClientsPageClientProps {
  clients: ClientListItem[];
  allTags: string[];
}

export function ClientsPageClient({ clients, allTags }: ClientsPageClientProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");

  const filteredClients = useMemo(() => {
    let result = clients;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter((c) =>
        selectedTags.every((tag) => c.tags?.includes(tag))
      );
    }

    // Series filter
    if (seriesFilter === "active") {
      result = result.filter((c) => c.active_series?.status === "active");
    } else if (seriesFilter === "completed") {
      result = result.filter((c) => c.active_series?.status === "completed");
    } else if (seriesFilter === "none") {
      result = result.filter((c) => !c.active_series);
    }

    // Intake filter
    if (intakeFilter === "complete") {
      result = result.filter((c) => c.intake_completed);
    } else if (intakeFilter === "pending") {
      result = result.filter((c) => !c.intake_completed);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortField) {
        case "name":
          return `${a.last_name} ${a.first_name}`.localeCompare(
            `${b.last_name} ${b.first_name}`
          );
        case "last_visit":
          if (!a.last_visit && !b.last_visit) return 0;
          if (!a.last_visit) return 1;
          if (!b.last_visit) return -1;
          return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
        case "next_appointment":
          if (!a.next_appointment && !b.next_appointment) return 0;
          if (!a.next_appointment) return 1;
          if (!b.next_appointment) return -1;
          return (
            new Date(a.next_appointment).getTime() -
            new Date(b.next_appointment).getTime()
          );
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [clients, search, selectedTags, seriesFilter, intakeFilter, sortField]);

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">Clients</h1>
          <p className="text-muted-foreground">
            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientSortMenu value={sortField} onChange={setSortField} />
          <ViewSwitcher view={view} onViewChange={setView} />
          <ClientDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </ClientDialog>
        </div>
      </div>

      <ClientFilters
        search={search}
        onSearchChange={setSearch}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        seriesFilter={seriesFilter}
        onSeriesFilterChange={setSeriesFilter}
        intakeFilter={intakeFilter}
        onIntakeFilterChange={setIntakeFilter}
      />

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No clients found</p>
          <p className="text-sm">
            {clients.length === 0
              ? "Add your first client to get started."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Next Apt</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Intake</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <ClientTableRow key={client.id} client={client} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
