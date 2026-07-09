import Image from "next/image";
import { listDepartmentsForStudent } from "@/features/students/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Student Portal | LAT" };

export default async function RegisterPage() {
  const departments = await listDepartmentsForStudent();

  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col">
      {/* Brand header */}
      <div className="bg-(--color-brand) px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <Image src="/lasu-logo.png" alt="LASU" width={36} height={36} className="object-contain" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">LASU Academic Timetable</p>
          <p className="text-white/60 text-[11px] leading-tight mt-0.5">Student Portal</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Register or sign in to access your timetable and class reminders.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <RegisterForm departments={departments} />
          </div>
        </div>
      </div>
    </div>
  );
}
