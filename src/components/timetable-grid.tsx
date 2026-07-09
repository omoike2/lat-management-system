"use client";

import { AlertTriangle } from "lucide-react";
import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations } from "@/features/timetable/types";
import type { StudyBlock } from "@/features/students/study-planner";
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
  studyBlocks?: StudyBlock[];
  onCellClick?: (entry: TimetableEntryWithRelations | null, slotId: string, day: number) => void;
}

export function TimetableGrid({ entries, slots, mode, studyBlocks, onCellClick }: TimetableGridProps) {
  const depts = [...new Set(entries.map((e) => e.course.department))].sort();
  const deptColorIndex = (dept: string) => depts.indexOf(dept) % DEPT_COLORS.length;

  // Unique period times (columns), sorted
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

  // Study block lookup: slotId → StudyBlock
  const studyMap = new Map<string, StudyBlock>();
  for (const block of studyBlocks ?? []) {
    studyMap.set(block.slotId, block);
  }

  // Dynamic column template: day-label column + one column per time period
  const gridCols = `110px repeat(${periodTimes.length}, minmax(120px, 1fr))`;

  // Check if a period has all unavailable slots (lunch break column)
  const isBreakPeriod = (time: string) => {
    const periodSlots = slots.filter((s) => s.startTime === time);
    return periodSlots.length > 0 && periodSlots.every((s) => !s.available);
  };

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${110 + periodTimes.length * 120}px` }}>
        {/* Header row — time labels across the top */}
        <div className="grid mb-1" style={{ gridTemplateColumns: gridCols }}>
          <div />
          {periodTimes.map((time) => (
            <div
              key={time}
              className={cn(
                "text-center text-xs font-semibold uppercase tracking-wide py-2",
                isBreakPeriod(time) ? "text-gray-300" : "text-gray-500"
              )}
            >
              {formatTime(time)}
            </div>
          ))}
        </div>

        {/* Day rows */}
        <div className="space-y-1">
          {DAY_LABELS.map((dayLabel, day) => (
            <div key={day} className="grid gap-1" style={{ gridTemplateColumns: gridCols }}>
              {/* Day label */}
              <div className="text-xs font-semibold text-gray-500 pr-2 flex items-center justify-end uppercase tracking-wide">
                {dayLabel}
              </div>

              {/* One cell per time period */}
              {periodTimes.map((time) => {
                const slot = slotMap.get(`${day}-${time}`);

                // Break column cell
                if (isBreakPeriod(time)) {
                  return (
                    <div
                      key={time}
                      className="h-16 rounded-md bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center"
                    >
                      {day === 0 && (
                        <span className="text-[10px] text-gray-300 font-medium rotate-0">Lunch</span>
                      )}
                    </div>
                  );
                }

                if (!slot) {
                  return <div key={time} className="h-16" />;
                }

                const cellEntries = entryMap.get(slot.id) ?? [];
                const groupKeys = cellEntries.map((e) => `${e.course.department}-${e.course.level}`);

                if (cellEntries.length === 0) {
                  if (mode === "admin") {
                    return (
                      <button
                        key={time}
                        onClick={() => onCellClick?.(null, slot.id, day)}
                        className="h-16 rounded-md border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center group"
                      >
                        <span className="text-gray-300 group-hover:text-gray-500 text-xl leading-none">
                          +
                        </span>
                      </button>
                    );
                  }
                  const studyBlock = studyMap.get(slot.id);
                  if (studyBlock) {
                    return (
                      <div
                        key={time}
                        className="h-16 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-1 overflow-hidden"
                      >
                        <span className="text-[10px] font-semibold text-amber-700 block truncate">
                          📖 Self Study
                        </span>
                        <span className="text-[10px] text-amber-600 block truncate">
                          {studyBlock.courseCode}
                        </span>
                        <span className="text-[10px] text-amber-500 block truncate">
                          {studyBlock.courseTitle}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={time}
                      className="h-16 rounded-md border border-dashed border-gray-100"
                    />
                  );
                }

                return (
                  <div key={time} className="flex flex-col gap-0.5">
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
          ))}
        </div>
      </div>
    </div>
  );
}
