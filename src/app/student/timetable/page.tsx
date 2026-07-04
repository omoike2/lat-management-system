import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudentByMatric } from "@/features/students/queries";
import { getStudentTimetableEntries, getTimeSlots } from "@/features/timetable/queries";
import { TimetableGrid } from "@/components/timetable-grid";
import { StudentScheduleList } from "@/components/student-schedule-list";

const SEMESTERS = ["2024/2025 First", "2024/2025 Second", "2025/2026 First", "2025/2026 Second"];
const DEFAULT_SEMESTER = "2024/2025 First";

interface StudentTimetablePageProps {
  searchParams: Promise<{ semester?: string }>;
}

export const metadata = { title: "My Timetable | LAT" };

export default async function StudentTimetablePage({ searchParams }: StudentTimetablePageProps) {
  const cookieStore = await cookies();
  const matric = cookieStore.get("studentMatric")?.value;

  if (!matric) redirect("/student/register");

  const student = await getStudentByMatric(decodeURIComponent(matric));
  if (!student) redirect("/student/register");

  const { semester: semesterParam } = await searchParams;
  const semester = SEMESTERS.includes(semesterParam ?? "") ? (semesterParam ?? DEFAULT_SEMESTER) : DEFAULT_SEMESTER;

  const [entries, slots] = await Promise.all([
    getStudentTimetableEntries(student.department, student.level, semester),
    getTimeSlots(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student info card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {student.matric} · {student.department} · Level {student.level}
          </p>
        </div>
        <a
          href="/student/register"
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Switch account
        </a>
      </div>

      {/* Semester selector */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entries.length} class{entries.length !== 1 ? "es" : ""} this semester
          </p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <select
            name="semester"
            defaultValue={semester}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none bg-white"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 px-3 rounded-md bg-[#006633] text-white text-sm font-medium hover:bg-[#005229] transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No classes scheduled for this semester.</p>
          </div>
        ) : (
          <TimetableGrid entries={entries} slots={slots} mode="student" />
        )}
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        <StudentScheduleList entries={entries} />
      </div>
    </div>
  );
}
