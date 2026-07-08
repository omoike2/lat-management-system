import { requireLecturerAuth, getLecturerTimetableEntries } from "@/features/lecturers/queries";
import { listVenues } from "@/features/venues/queries";
import { VenueChangePanel } from "./venue-change-panel";
import { SEMESTERS, DEFAULT_SEMESTER } from "@/lib/constants";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface LecturerTimetablePageProps {
  searchParams: Promise<{ semester?: string }>;
}

export const metadata = { title: "My Timetable | LAT Lecturer" };

export default async function LecturerTimetablePage({ searchParams }: LecturerTimetablePageProps) {
  const lecturer = await requireLecturerAuth();

  const { semester: semesterParam } = await searchParams;
  const semester =
    SEMESTERS.includes(semesterParam ?? "") ? (semesterParam ?? DEFAULT_SEMESTER) : DEFAULT_SEMESTER;

  const [entries, venues] = await Promise.all([
    getLecturerTimetableEntries(lecturer.id, semester),
    listVenues(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entries.length} class{entries.length !== 1 ? "es" : ""} · {semester}
          </p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <select
            name="semester"
            defaultValue={semester}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none bg-white"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 px-3 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-400">No classes scheduled for this semester.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const day = DAY_LABELS[entry.slot.dayOfWeek] ?? "—";
            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{entry.course.code}</span>
                    <span className="text-xs text-gray-400">—</span>
                    <span className="text-sm text-gray-700">{entry.course.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {day} · {entry.slot.startTime}–{entry.slot.endTime} · {entry.venue.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.course.department} Level {entry.course.level}
                  </p>
                </div>
                <VenueChangePanel
                  entryId={entry.id}
                  currentVenueId={entry.venueId}
                  venues={venues}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
