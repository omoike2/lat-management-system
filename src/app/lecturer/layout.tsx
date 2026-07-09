import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { getLecturerById } from "@/features/lecturers/queries";
import { logoutLecturer } from "@/features/lecturers/actions";

export default async function LecturerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lecturerId = cookieStore.get("lecturerId")?.value;
  const lecturer = lecturerId ? await getLecturerById(lecturerId) : null;

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <header className="bg-(--color-brand) sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7">
                <Image src="/lasu-logo.png" alt="LASU" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-sm font-semibold text-white">LAT — Lecturer</span>
            </div>
            {lecturer && (
              <Link
                href="/lecturer/timetable"
                className="text-xs font-medium text-white/80 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                My Timetable
              </Link>
            )}
          </div>
          {lecturer ? (
            <form action={logoutLecturer}>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{lecturer.name}</p>
                  {lecturer.department && (
                    <p className="text-xs text-white/60">{lecturer.department}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
