"use client";

import { useState, useTransition } from "react";
import { changeVenue } from "@/features/lecturers/actions";
import type { VenueWithCount } from "@/features/venues/types";

interface VenueChangePanelProps {
  entryId: string;
  currentVenueId: string;
  venues: VenueWithCount[];
}

export function VenueChangePanel({ entryId, currentVenueId, venues }: VenueChangePanelProps) {
  const [selectedVenueId, setSelectedVenueId] = useState(currentVenueId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const isDirty = selectedVenueId !== currentVenueId;

  function handleSave() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changeVenue({ entryId, venueId: selectedVenueId });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Failed to change venue");
        setSelectedVenueId(currentVenueId);
      }
    });
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <select
        value={selectedVenueId}
        onChange={(e) => {
          setSelectedVenueId(e.target.value);
          setSuccess(false);
          setError(null);
        }}
        className="h-9 rounded-md border border-gray-300 px-2 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none bg-white min-w-[140px]"
        disabled={pending}
      >
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} ({v.capacity})
          </option>
        ))}
      </select>
      {isDirty && (
        <button
          onClick={handleSave}
          disabled={pending}
          className="h-9 px-3 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {pending ? "Saving…" : "Change Venue"}
        </button>
      )}
      {success && !isDirty && (
        <span className="text-xs text-green-600 font-medium">Updated ✓</span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
