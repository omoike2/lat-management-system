import type { TimetableEntryWithRelations } from "@/features/timetable/types";
import { DAY_LABELS } from "@/types";
import { formatTime } from "@/lib/utils";

interface StudentScheduleListProps {
  entries: TimetableEntryWithRelations[];
}

export function StudentScheduleList({ entries }: StudentScheduleListProps) {
  const byDay = new Map<number, TimetableEntryWithRelations[]>();
  for (const entry of entries) {
    const day = entry.slot.dayOfWeek;
    const list = byDay.get(day) ?? [];
    list.push(entry);
    byDay.set(day, list);
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400">No classes scheduled for your dept/level this semester.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {[0, 1, 2, 3, 4].map((day) => {
        const dayEntries = (byDay.get(day) ?? []).sort((a, b) =>
          a.slot.startTime.localeCompare(b.slot.startTime)
        );
        if (dayEntries.length === 0) return null;

        return (
          <div key={day}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              {DAY_LABELS[day]}
            </h3>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-start gap-3"
                >
                  <div className="text-xs font-medium text-gray-500 whitespace-nowrap pt-0.5 w-[4.5rem] flex-shrink-0 leading-tight">
                    <span className="block">{formatTime(entry.slot.startTime)}</span>
                    <span className="block text-gray-400">{formatTime(entry.slot.endTime)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {entry.course.code}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{entry.course.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {entry.venue.name} · {entry.lecturer.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
