import { listDepartmentsForStudent } from "@/features/students/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Register | LAT" };

export default async function RegisterPage() {
  const departments = await listDepartmentsForStudent();

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Student registration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register once to access your personal timetable and receive class reminders.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <RegisterForm departments={departments} />
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Already registered?{" "}
        <a href="/student/timetable" className="text-[#006633] hover:underline">
          View your timetable
        </a>
      </p>
    </div>
  );
}
