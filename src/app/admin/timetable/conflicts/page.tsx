import { listCourses } from "@/features/courses/queries";
import { listLecturers } from "@/features/lecturers/queries";
import { listVenues } from "@/features/venues/queries";
import { getEntriesForSemester, getTimeSlots } from "@/features/timetable/queries";
import { ConflictForm } from "./conflict-form";
import { CheckCircle2 } from "lucide-react";
import { DEFAULT_SEMESTER } from "@/lib/constants";

export default async function ConflictsPage() {
  const [courses, lecturers, venues, entries, slots] = await Promise.all([
    listCourses(),
    listLecturers(),
    listVenues(),
    getEntriesForSemester(DEFAULT_SEMESTER),
    getTimeSlots(),
  ]);

  const assignedCourseIds = new Set(entries.map((e) => e.courseId));
  const unassigned = courses.filter((c) => !assignedCourseIds.has(c.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-(--color-text-primary)">Conflict Resolution</h1>
        <p className="text-sm text-(--color-text-secondary) mt-1">
          Manually assign slots for courses that could not be automatically scheduled
        </p>
      </div>

      {unassigned.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
          <p className="text-sm text-gray-600 font-medium">All courses are scheduled</p>
          <p className="text-xs text-gray-400 mt-1">No unresolved conflicts for {DEFAULT_SEMESTER}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {unassigned.length} course{unassigned.length !== 1 ? "s" : ""} unscheduled for{" "}
            <span className="font-medium">{DEFAULT_SEMESTER}</span>
          </p>
          {unassigned.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{course.code}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{course.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {course.department} · Level {course.level} · {course.units} units
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap">
                  Unscheduled
                </span>
              </div>

              <ConflictForm
                course={course}
                slots={slots}
                venues={venues}
                lecturers={lecturers}
                semester={DEFAULT_SEMESTER}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
