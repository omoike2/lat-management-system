import { listDepartmentsForStudent } from "@/features/students/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Student Portal | LAT" };

export default async function RegisterPage() {
  const departments = await listDepartmentsForStudent();

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 sm:pb-8">
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
  );
}
