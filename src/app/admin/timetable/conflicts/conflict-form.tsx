"use client";

import { useState, useTransition } from "react";
import type { TimeSlot } from "@prisma/client";
import type { CourseWithLecturers } from "@/features/courses/types";
import type { LecturerWithCourses } from "@/features/lecturers/types";
import type { VenueWithCount } from "@/features/venues/types";
import { manualAssign } from "@/features/timetable/actions";
import { DAY_LABELS } from "@/types";

interface ConflictFormProps {
  course: CourseWithLecturers;
  slots: TimeSlot[];
  venues: VenueWithCount[];
  lecturers: LecturerWithCourses[];
  semester: string;
}

export function ConflictForm({ course, slots, venues, lecturers, semester }: ConflictFormProps) {
  const [slotId, setSlotId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [lecturerId, setLecturerId] = useState(course.lecturers[0]?.lecturer.id ?? "");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableSlots = slots.filter((s) => s.available);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await manualAssign({ courseId: course.id, lecturerId, venueId, slotId, semester });
      if (res.success) {
        setResult({ success: true, message: "Assigned successfully" });
      } else {
        setResult({ success: false, message: res.error ?? "Assignment failed" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time slot</label>
          <select
            required
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="w-full h-8 rounded-md border border-gray-300 px-2 text-xs focus:border-(--color-brand) outline-none"
          >
            <option value="">Select slot…</option>
            {availableSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {DAY_LABELS[s.dayOfWeek]} {s.startTime}–{s.endTime}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
          <select
            required
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="w-full h-8 rounded-md border border-gray-300 px-2 text-xs focus:border-(--color-brand) outline-none"
          >
            <option value="">Select venue…</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} (cap. {v.capacity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lecturer</label>
          <select
            required
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
            className="w-full h-8 rounded-md border border-gray-300 px-2 text-xs focus:border-(--color-brand) outline-none"
          >
            <option value="">Select lecturer…</option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !slotId || !venueId || !lecturerId}
          className="h-8 px-3 rounded-md bg-(--color-brand) text-white text-xs font-medium hover:bg-(--color-brand-hover) disabled:opacity-50 transition-colors"
        >
          {isPending ? "Assigning…" : "Assign slot"}
        </button>
        {result && (
          <span className={`text-xs ${result.success ? "text-green-700" : "text-red-600"}`}>
            {result.message}
          </span>
        )}
      </div>
    </form>
  );
}
