import { LecturerLoginForm } from "./lecturer-login-form";

export const metadata = { title: "Lecturer Login | LAT" };

export default function LecturerLoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Lecturer Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your classes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <LecturerLoginForm />
        </div>
      </div>
    </div>
  );
}
