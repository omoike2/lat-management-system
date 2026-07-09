"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerStudent, loginStudent } from "@/features/students/actions";
import { LEVELS } from "@/types";

interface RegisterFormProps {
  departments: string[];
}

export function RegisterForm({ departments }: RegisterFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"register" | "login">("register");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerStudent({
        name: data.get("name"),
        email: data.get("email"),
        matric: data.get("matric"),
        department: data.get("department"),
        level: data.get("level"),
      });

      if (!result.success) {
        setError(result.error ?? "Registration failed");
        return;
      }

      router.push("/student/timetable");
      router.refresh();
    });
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginStudent({ matric: data.get("matric") });

      if (!result.success) {
        setError(result.error ?? "Login failed");
        return;
      }

      router.push("/student/timetable");
      router.refresh();
    });
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
        <button
          type="button"
          onClick={() => { setTab("register"); setError(null); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "register"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          New student
        </button>
        <button
          type="button"
          onClick={() => { setTab("login"); setError(null); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "login"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Already registered
        </button>
      </div>

      {tab === "register" ? (
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="matric" className="block text-sm font-medium text-gray-700">
              Matric number
            </label>
            <input
              id="matric"
              name="matric"
              type="text"
              required
              placeholder="e.g. 190601001"
              className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition bg-white"
              >
                <option value="">Select…</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                Level
              </label>
              <select
                id="level"
                name="level"
                required
                className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition bg-white"
              >
                <option value="">Select…</option>
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors"
          >
            {isPending ? "Registering…" : "Register"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="login-matric" className="block text-sm font-medium text-gray-700">
              Matric number
            </label>
            <input
              id="login-matric"
              name="matric"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. 190601001"
              className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Enter your matric number to access your timetable
          </p>
        </form>
      )}
    </div>
  );
}
