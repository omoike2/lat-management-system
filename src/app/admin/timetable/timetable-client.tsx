"use client";

import { useState, useTransition } from "react";
import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations, ConflictReport } from "@/types";
import { generateTimetable } from "@/features/timetable/actions";
import { TimetableGrid } from "@/components/timetable-grid";
import { ConflictBadge } from "@/components/conflict-badge";
import { ChevronDown, Loader2, Zap } from "lucide-react";
import { SEMESTERS } from "@/lib/constants";

interface TimetableClientProps {
  initialEntries: TimetableEntryWithRelations[];
  initialSlots: TimeSlot[];
  initialSemester: string;
}

export function TimetableClient({ initialEntries, initialSlots, initialSemester }: TimetableClientProps) {
  const [semester, setSemester] = useState(initialSemester);
  const entries = initialEntries;
  const [conflicts, setConflicts] = useState<ConflictReport[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateTimetable({ semester });
      if (!result.success) {
        showToast("error", result.error ?? "Generation failed");
        return;
      }
      setConflicts(result.data?.conflicts ?? []);
      showToast(
        "success",
        `Generated ${result.data?.assigned ?? 0} entries${result.data?.conflicts.length ? `, ${result.data.conflicts.length} unresolved` : ""}`
      );
      // Refresh entries by navigating — we reload via window for simplicity
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="h-9 rounded-md border border-gray-300 pl-3 pr-8 text-sm text-gray-700 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none appearance-none bg-white"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2 w-4 h-4 text-gray-400" />
          </div>
          <ConflictBadge count={conflicts.length} />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Generate timetable
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Grid */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Zap className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No timetable generated yet for this semester.</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;Generate timetable&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <TimetableGrid entries={entries} slots={initialSlots} mode="admin" />
        </div>
      )}

      {/* Unresolved conflicts list */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-3">
            Unresolved conflicts ({conflicts.length})
          </h3>
          <div className="space-y-2">
            {conflicts.map((c) => (
              <div
                key={c.courseId}
                className="flex items-center justify-between bg-white rounded-md border border-red-100 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-800">{c.courseCode}</span>
                <span className="text-xs text-red-600">
                  {c.reason === "NO_VENUE_AVAILABLE"
                    ? "No venue available"
                    : c.reason === "LECTURER_UNAVAILABLE"
                    ? "Lecturer unavailable"
                    : "Group clash"}
                </span>
              </div>
            ))}
          </div>
          <a
            href="/admin/timetable/conflicts"
            className="inline-block mt-3 text-xs text-red-700 underline underline-offset-2"
          >
            Resolve manually →
          </a>
        </div>
      )}
    </div>
  );
}
