import Link from "next/link";
import { BookOpen, Users, Building2, CalendarDays, GraduationCap, ArrowRight } from "lucide-react";
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
    {
      label: "Courses",
      value: stats.courses,
      icon: BookOpen,
      href: "/admin/courses",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "before:bg-blue-500",
    },
    {
      label: "Lecturers",
      value: stats.lecturers,
      icon: Users,
      href: "/admin/lecturers",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      accent: "before:bg-purple-500",
    },
    {
      label: "Venues",
      value: stats.venues,
      icon: Building2,
      href: "/admin/venues",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      accent: "before:bg-orange-500",
    },
    {
      label: "Students",
      value: stats.students,
      icon: GraduationCap,
      href: "/admin/students",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      accent: "before:bg-teal-500",
    },
    {
      label: "Timetable Entries",
      value: stats.timetableEntries,
      icon: CalendarDays,
      href: "/admin/timetable",
      iconBg: "bg-(--color-brand-light)",
      iconColor: "text-(--color-brand)",
      accent: "before:bg-(--color-brand)",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-(--color-text-primary)">Dashboard</h1>
        <p className="text-sm text-(--color-text-secondary) mt-1">
          {CURRENT_SEMESTER} semester overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, href, iconBg, iconColor, accent }) => (
          <Link
            key={label}
            href={href}
            className={`relative bg-white rounded-xl border border-(--color-border) shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-(--color-border-strong) transition-all group overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 ${accent}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon size={18} className={iconColor} />
              </div>
              <ArrowRight
                size={14}
                className="text-(--color-text-muted) group-hover:text-(--color-brand) transition-colors"
              />
            </div>
            <div>
              <p className="text-3xl font-bold text-(--color-text-primary) tabular-nums">
                {value}
              </p>
              <p className="text-[13px] text-(--color-text-secondary) mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-(--color-border) shadow-sm p-6">
          <h2 className="text-base font-semibold text-(--color-text-primary) mb-1">
            Current Semester
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-4">{CURRENT_SEMESTER}</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/timetable"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors"
            >
              <CalendarDays size={15} />
              View timetable
            </Link>
            <Link
              href="/admin/timetable/conflicts"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-(--color-border) text-sm font-medium text-(--color-text-primary) hover:bg-(--color-bg) transition-colors"
            >
              Resolve conflicts
            </Link>
          </div>
        </div>

        <div className="bg-(--color-brand-light) rounded-xl border border-(--color-brand)/20 p-6">
          <h2 className="text-base font-semibold text-(--color-brand) mb-1">
            LASU Academic Timetable
          </h2>
          <p className="text-sm text-(--color-brand)/70 mb-4">
            Manage courses, lecturers, and venues. Generate conflict-free timetables automatically.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-(--color-brand)/80">
            <span>{stats.courses} courses</span>
            <span>·</span>
            <span>{stats.lecturers} lecturers</span>
            <span>·</span>
            <span>{stats.venues} venues</span>
          </div>
        </div>
      </div>
    </div>
  );
}
