import { listDepartmentsForStudent } from "@/features/students/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Student Portal | LAT" };

export default async function RegisterPage() {
  const departments = await listDepartmentsForStudent();

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student portal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register or sign in to access your timetable and class reminders.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <RegisterForm departments={departments} />
      </div>
    </div>
  );
}
