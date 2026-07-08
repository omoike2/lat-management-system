import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudentById, getStudentCourses } from "@/features/students/queries";
import { getStudentTimetableEntries, getTimeSlots } from "@/features/timetable/queries";
import { planStudyTimetable } from "@/features/students/study-planner";
import { TimetableGrid } from "@/components/timetable-grid";
import { StudentScheduleList } from "@/components/student-schedule-list";

const SEMESTERS = ["2024/2025 First", "2024/2025 Second", "2025/2026 First", "2025/2026 Second"];
const DEFAULT_SEMESTER = "2024/2025 First";

interface StudentStudyPageProps {
  searchParams: Promise<{ semester?: string }>;
}

export const metadata = { title: "Study Plan | LAT" };

export default async function StudentStudyPage({ searchParams }: StudentStudyPageProps) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("studentId")?.value;

  if (!studentId) redirect("/student/register");

  const student = await getStudentById(studentId);
  if (!student) redirect("/student/register");

  const { semester: semesterParam } = await searchParams;
  const semester =
    SEMESTERS.includes(semesterParam ?? "") ? (semesterParam ?? DEFAULT_SEMESTER) : DEFAULT_SEMESTER;

  const [courses, classEntries, allSlots] = await Promise.all([
    getStudentCourses(studentId, student.department, student.level),
    getStudentTimetableEntries(studentId, student.department, student.level, semester),
    getTimeSlots(),
  ]);

  const studyBlocks = planStudyTimetable(courses, classEntries, allSlots);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Study Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {studyBlocks.length} study block{studyBlocks.length !== 1 ? "s" : ""} across{" "}
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <form method="get">
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
            className="ml-2 h-9 px-3 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-200" />
          Class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Self study
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-400">
            No courses found. Register your courses first to generate a study plan.
          </p>
          <a
            href="/student/courses"
            className="mt-3 inline-block text-sm text-(--color-brand) underline underline-offset-2"
          >
            Register courses →
          </a>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <TimetableGrid
              entries={classEntries}
              slots={allSlots}
              mode="student"
              studyBlocks={studyBlocks}
            />
          </div>
          <div className="md:hidden">
            <StudentScheduleList entries={classEntries} />
            {studyBlocks.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-amber-800 mb-2">Study Blocks</h2>
                <ul className="space-y-1">
                  {studyBlocks.map((b) => {
                    const slot = allSlots.find((s) => s.id === b.slotId);
                    return (
                      <li key={`${b.courseId}-${b.slotId}`} className="text-xs text-amber-700">
                        {b.courseCode} — slot {slot?.startTime ?? b.slotId}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
