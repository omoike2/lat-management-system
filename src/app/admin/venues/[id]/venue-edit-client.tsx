"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormField } from "@/components/form-field";
import { updateVenue } from "@/features/venues/actions";
import type { VenueWithCount } from "@/features/venues/types";
import { VenueType } from "@prisma/client";

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  SEMINAR_ROOM: "Seminar Room",
};

export default function VenueEditClient({ venue }: { venue: VenueWithCount }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = { ...Object.fromEntries(new FormData(e.currentTarget)), id: venue.id };
    startTransition(async () => {
      const result = await updateVenue(raw);
      if (result.success) {
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error ?? "Update failed");
      }
    });
  }

  return (
    <div>
      <button onClick={() => router.push("/admin/venues")} className="flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) mb-6 transition-colors">
        <ArrowLeft size={16} /> Venues
      </button>

      <h1 className="text-2xl font-semibold text-(--color-text-primary) mb-6">{venue.name}</h1>

      <div className="max-w-md bg-white rounded-lg border border-(--color-border) shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="name" label="Name" required>
            <input id="name" name="name" defaultValue={venue.name} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>
          <FormField id="capacity" label="Capacity" required>
            <input id="capacity" name="capacity" type="number" min={1} defaultValue={venue.capacity} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>
          <FormField id="type" label="Type" required>
            <select id="type" name="type" defaultValue={venue.type} className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none bg-white">
              {Object.entries(VENUE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>
          {venue._count.entries > 0 && (
            <p className="text-xs text-(--color-text-muted)">This venue has {venue._count.entries} active timetable entries.</p>
          )}
          {error && <p className="text-xs text-(--color-danger)">{error}</p>}
          {success && <p className="text-xs text-(--color-success)">Saved.</p>}
          <button type="submit" disabled={isPending} className="h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors">
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
