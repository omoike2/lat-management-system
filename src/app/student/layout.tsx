import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { getStudentById } from "@/features/students/queries";
import { logoutStudent } from "@/features/students/actions";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("studentId")?.value;
  const student = studentId ? await getStudentById(studentId) : null;

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <header className="bg-(--color-brand) sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7">
                <Image src="/lasu-logo.png" alt="LASU" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-sm font-semibold text-white">LAT System</span>
            </div>
            {student && (
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/student/timetable"
                  className="text-xs font-medium text-white/80 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  Timetable
                </Link>
                <Link
                  href="/student/courses"
                  className="text-xs font-medium text-white/80 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  My Courses
                </Link>
                <Link
                  href="/student/study"
                  className="text-xs font-medium text-white/80 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  Study Plan
                </Link>
              </nav>
            )}
          </div>
          {student && (
            <form action={logoutStudent} className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{student.name}</p>
                <p className="text-xs text-white/60">
                  {student.department} · Level {student.level}
                </p>
              </div>
              <button
                type="submit"
                className="text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
