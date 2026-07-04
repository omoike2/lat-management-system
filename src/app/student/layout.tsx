import { cookies } from "next/headers";
import { getStudentById } from "@/features/students/queries";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("studentId")?.value;
  const student = studentId ? await getStudentById(studentId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#006633]">
              <span className="text-white text-xs font-bold leading-none">L</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">LAT System</span>
          </div>
          {student && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-500">
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
