import { cookies } from "next/headers";
import { getStudentById } from "@/features/students/queries";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("studentId")?.value;
  const student = studentId ? await getStudentById(studentId) : null;

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <header className="bg-(--color-brand) sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/15 border border-white/25">
              <span className="text-white text-xs font-bold leading-none">L</span>
            </div>
            <span className="text-sm font-semibold text-white">LAT System</span>
          </div>
          {student && (
            <div className="text-right">
              <p className="text-sm font-medium text-white">{student.name}</p>
              <p className="text-xs text-white/60">
                {student.department} · Level {student.level}
              </p>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
