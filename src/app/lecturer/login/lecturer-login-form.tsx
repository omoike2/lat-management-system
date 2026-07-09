"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginLecturer } from "@/features/lecturers/actions";

export function LecturerLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await loginLecturer({
        email: form.get("email"),
        password: form.get("password"),
      });
      if (result.success) {
        router.push("/lecturer/timetable");
      } else {
        setError(result.error ?? "Login failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
