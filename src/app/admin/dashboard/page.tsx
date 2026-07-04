import { db } from "@/lib/db";
import { getTimetableSummary } from "@/features/timetable/queries";

const CURRENT_SEMESTER = "2024/2025 First";

async function getStats() {
  const [courses, lecturers, venues, students, timetable] = await Promise.all([
    db.course.count(),
    db.lecturer.count(),
    db.venue.count(),
    db.student.count(),
    getTimetableSummary(CURRENT_SEMESTER),
  ]);
  return { courses, lecturers, venues, students, timetableEntries: timetable.entryCount };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Courses", value: stats.courses },
    { label: "Lecturers", value: stats.lecturers },
    { label: "Venues", value: stats.venues },
    { label: "Students", value: stats.students },
    { label: "Timetable Entries", value: stats.timetableEntries },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[--color-text-primary]">Dashboard</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">Overview of the timetable system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-[--color-border] shadow-sm p-6">
            <p className="text-[13px] font-medium text-[--color-text-secondary]">{label}</p>
            <p className="text-3xl font-semibold text-[--color-text-primary] mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
