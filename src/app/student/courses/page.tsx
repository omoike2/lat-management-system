import { requireStudentAuth, getRegisteredCourseIds, listCoursesForRegistration } from "@/features/students/queries";
import { CourseRegistrationForm } from "./course-registration-form";

export const metadata = { title: "My Courses | LAT" };

export default async function StudentCoursesPage() {
  const student = await requireStudentAuth();

  const [allCourses, registeredIds] = await Promise.all([
    listCoursesForRegistration(),
    getRegisteredCourseIds(student.id),
  ]);

  const registeredSet = new Set(registeredIds);

  // Group by department
  const byDept = allCourses.reduce<Record<string, typeof allCourses>>((acc, course) => {
    if (!acc[course.department]) acc[course.department] = [];
    acc[course.department].push(course);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your courses are shown automatically. Tick extras for carryovers or electives.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(byDept).map(([dept, courses]) => (
          <div key={dept} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 truncate">{dept}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const isOwnLevel = course.department === student.department && course.level === student.level;
                const isRegistered = registeredSet.has(course.id);
                return (
                  <CourseRegistrationForm
                    key={course.id}
                    courseId={course.id}
                    label={`${course.code} — ${course.title}`}
                    sublabel={`Level ${course.level} · ${course.units} units`}
                    isOwnLevel={isOwnLevel}
                    isRegistered={isRegistered}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
