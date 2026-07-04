"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerStudent } from "@/features/students/actions";
import { LEVELS } from "@/types";

interface RegisterFormProps {
  departments: string[];
}

export function RegisterForm({ departments }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

      // Cookie is set server-side (httpOnly) — just redirect
      router.push("/student/timetable");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none transition"
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
          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none transition"
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
          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department"
            name="department"
            required
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none transition bg-white"
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
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 outline-none transition bg-white"
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
        className="w-full h-10 rounded-md bg-[#006633] text-white text-sm font-medium hover:bg-[#005229] disabled:opacity-60 transition-colors"
      >
        {isPending ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
