import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLecturerById, getLecturerTimetableEntries } from "@/features/lecturers/queries";
import { listVenues } from "@/features/venues/queries";
import { VenueChangePanel } from "./venue-change-panel";

const SEMESTERS = ["2024/2025 First", "2024/2025 Second", "2025/2026 First", "2025/2026 Second"];
const DEFAULT_SEMESTER = "2024/2025 First";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface LecturerTimetablePageProps {
  searchParams: Promise<{ semester?: string }>;
}

export const metadata = { title: "My Timetable | LAT Lecturer" };

export default async function LecturerTimetablePage({ searchParams }: LecturerTimetablePageProps) {
  const cookieStore = await cookies();
  const lecturerId = cookieStore.get("lecturerId")?.value;

  if (!lecturerId) redirect("/lecturer/login");

  const lecturer = await getLecturerById(lecturerId);
  if (!lecturer) redirect("/lecturer/login");

  const { semester: semesterParam } = await searchParams;
  const semester =
    SEMESTERS.includes(semesterParam ?? "") ? (semesterParam ?? DEFAULT_SEMESTER) : DEFAULT_SEMESTER;

  const [entries, venues] = await Promise.all([
    getLecturerTimetableEntries(lecturerId, semester),
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
        <form method="get">
          <select
            name="semester"
            defaultValue={semester}
            onChange={(e) => (e.currentTarget.form as HTMLFormElement)?.submit()}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none bg-white"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
