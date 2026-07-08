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
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const isDirty = selectedVenueId !== currentVenueId;

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await changeVenue({ entryId, venueId: selectedVenueId });
      if (result.success) {
        setMessage({ text: "Updated ✓", ok: true });
      } else {
        setMessage({ text: result.error ?? "Failed to change venue", ok: false });
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
          setMessage(null);
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
      {message && (
        <span className={`text-xs font-medium ${message.ok ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
