import { getEntriesForSemester, getTimeSlots } from "@/features/timetable/queries";
import { TimetableClient } from "./timetable-client";
import { DEFAULT_SEMESTER } from "@/lib/constants";

export default async function TimetablePage() {
  const [entries, slots] = await Promise.all([
    getEntriesForSemester(DEFAULT_SEMESTER),
    getTimeSlots(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-(--color-text-primary)">Timetable</h1>
        <p className="text-sm text-(--color-text-secondary) mt-1">
          Generate and manage the academic timetable for each semester
        </p>
      </div>

      <TimetableClient
        initialEntries={entries}
        initialSlots={slots}
        initialSemester={DEFAULT_SEMESTER}
      />
    </div>
  );
}
