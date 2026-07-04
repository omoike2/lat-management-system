"use client";

import { AlertTriangle } from "lucide-react";
import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations } from "@/features/timetable/types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEPT_COLORS = [
  "bg-blue-100 border-blue-200 text-blue-900",
  "bg-purple-100 border-purple-200 text-purple-900",
  "bg-orange-100 border-orange-200 text-orange-900",
  "bg-pink-100 border-pink-200 text-pink-900",
  "bg-teal-100 border-teal-200 text-teal-900",
  "bg-yellow-100 border-yellow-200 text-yellow-900",
  "bg-indigo-100 border-indigo-200 text-indigo-900",
  "bg-rose-100 border-rose-200 text-rose-900",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface TimetableGridProps {
  entries: TimetableEntryWithRelations[];
  slots: TimeSlot[];
  mode: "admin" | "student";
  onCellClick?: (entry: TimetableEntryWithRelations | null, slotId: string, day: number) => void;
}

export function TimetableGrid({ entries, slots, mode, onCellClick }: TimetableGridProps) {
  const depts = [...new Set(entries.map((e) => e.course.department))].sort();
  const deptColorIndex = (dept: string) => depts.indexOf(dept) % DEPT_COLORS.length;

  // Unique period times (rows), sorted
  const periodTimes = [...new Set(slots.map((s) => s.startTime))].sort();

  // Slot lookup: `${dayOfWeek}-${startTime}` → TimeSlot
  const slotMap = new Map(slots.map((s) => [`${s.dayOfWeek}-${s.startTime}`, s]));

  // Entry lookup: slotId → entries[]
  const entryMap = new Map<string, TimetableEntryWithRelations[]>();
  for (const entry of entries) {
    const list = entryMap.get(entry.slotId) ?? [];
    list.push(entry);
    entryMap.set(entry.slotId, list);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] mb-1">
          <div />
          {DAY_LABELS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Period rows */}
        <div className="space-y-1">
          {periodTimes.map((time) => {
            // Check if this period is a break (all slots unavailable)
            const periodSlots = slots.filter((s) => s.startTime === time);
            const isBreak = periodSlots.every((s) => !s.available);
            const displayTime = formatTime(time);

            if (isBreak) {
              return (
                <div key={time} className="grid grid-cols-[80px_repeat(5,1fr)]">
                  <div className="text-xs text-gray-400 pr-2 pt-1.5 text-right">{displayTime}</div>
                  <div className="col-span-5 bg-gray-50 border border-dashed border-gray-200 rounded-md flex items-center justify-center py-2">
                    <span className="text-xs text-gray-400 font-medium">Lunch Break</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={time} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1">
                <div className="text-xs text-gray-400 pr-2 pt-2 text-right whitespace-nowrap">
                  {displayTime}
                </div>
                {[0, 1, 2, 3, 4].map((day) => {
                  const slot = slotMap.get(`${day}-${time}`);
                  if (!slot) {
                    return <div key={day} className="h-16" />;
                  }

                  const cellEntries = entryMap.get(slot.id) ?? [];
                  // Conflict = two entries in same slot share dept+level
                  const groupKeys = cellEntries.map((e) => `${e.course.department}-${e.course.level}`);

                  if (cellEntries.length === 0) {
                    if (mode === "admin") {
                      return (
                        <button
                          key={day}
                          onClick={() => onCellClick?.(null, slot.id, day)}
                          className="h-16 rounded-md border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center group"
                        >
                          <span className="text-gray-300 group-hover:text-gray-500 text-xl leading-none">
                            +
                          </span>
                        </button>
                      );
                    }
                    return (
                      <div
                        key={day}
                        className="h-16 rounded-md border border-dashed border-gray-100"
                      />
                    );
                  }

                  return (
                    <div key={day} className="flex flex-col gap-0.5">
                      {cellEntries.map((entry) => {
                        const colorClass = DEPT_COLORS[deptColorIndex(entry.course.department)];
                        const entryKey = `${entry.course.department}-${entry.course.level}`;
                        const isDupe = groupKeys.filter((k) => k === entryKey).length > 1;
                        return (
                          <button
                            key={entry.id}
                            onClick={() => mode === "admin" && onCellClick?.(entry, slot.id, day)}
                            disabled={mode === "student"}
                            className={cn(
                              "flex-1 min-h-14 rounded-md border px-1.5 py-1 text-left overflow-hidden transition-all",
                              colorClass,
                              isDupe && "ring-2 ring-red-500 ring-offset-1",
                              mode === "admin" && "hover:opacity-80 cursor-pointer",
                              mode === "student" && "cursor-default"
                            )}
                          >
                            <div className="flex items-start justify-between gap-0.5">
                              <span className="text-[11px] font-bold leading-tight truncate">
                                {entry.course.code}
                              </span>
                              {isDupe && (
                                <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 mt-px" />
                              )}
                            </div>
                            <span className="text-[10px] leading-tight text-current/70 block truncate">
                              {entry.venue.name}
                            </span>
                            <span className="text-[10px] leading-tight text-current/70 block truncate">
                              {entry.lecturer.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
