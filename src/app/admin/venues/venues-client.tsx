"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { SlideOver } from "@/components/slide-over";
import { FormField } from "@/components/form-field";
import { createVenue, deleteVenue } from "@/features/venues/actions";
import type { VenueWithCount } from "@/features/venues/types";
import { VenueType } from "@prisma/client";

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  SEMINAR_ROOM: "Seminar Room",
};

interface Props {
  venues: VenueWithCount[];
}

export default function VenuesClient({ venues }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    startTransition(async () => {
      const result = await createVenue(raw);
      if (result.success) {
        setOpen(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create venue");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete venue "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteVenue(id);
      if (!result.success) alert(result.error);
      else router.refresh();
    });
  }

  const columns: Column<VenueWithCount>[] = [
    { key: "name", header: "Name", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "capacity", header: "Capacity", sortable: true, cell: (r) => r.capacity },
    { key: "type", header: "Type", sortable: true, cell: (r) => VENUE_TYPE_LABELS[r.type] },
    { key: "entries", header: "Active entries", cell: (r) => r._count.entries },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => router.push(`/admin/venues/${r.id}`)} className="h-8 w-8 rounded-md flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-bg) transition-colors"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(r.id, r.name)} className="h-8 w-8 rounded-md flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-danger-light) hover:text-(--color-danger) transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-(--color-text-primary)">Venues</h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">{venues.length} total</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors">
          <Plus size={16} /> Add venue
        </button>
      </div>

      <DataTable data={venues} columns={columns} searchPlaceholder="Search venues…" searchKeys={["name"]} emptyMessage="No venues yet." />

      <SlideOver
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Add venue"
        footer={
          <>
            <button type="button" onClick={() => { setOpen(false); setError(null); }} className="h-9 px-4 rounded-md border border-(--color-border) text-sm font-medium text-(--color-text-primary) hover:bg-(--color-bg) transition-colors">Cancel</button>
            <button form="venue-form" type="submit" disabled={isPending} className="h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors">{isPending ? "Creating…" : "Create"}</button>
          </>
        }
      >
        <form id="venue-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField id="name" label="Name" required>
            <input id="name" name="name" required placeholder="e.g. LT-1" className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>
          <FormField id="capacity" label="Capacity" required>
            <input id="capacity" name="capacity" type="number" min={1} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>
          <FormField id="type" label="Type" required>
            <select id="type" name="type" defaultValue={VenueType.LECTURE_HALL} className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none bg-white">
              {Object.entries(VENUE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>
          {error && <p className="text-xs text-(--color-danger)">{error}</p>}
        </form>
      </SlideOver>
    </div>
  );
}
