"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.get("email"),
        password: data.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between bg-(--color-brand) px-12 py-14 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full bg-white/[0.03]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white overflow-hidden">
            <Image src="/lasu-logo.png" alt="LASU" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase opacity-90">
            LASU — Academic Timetable
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
            Conflict-free<br />scheduling,<br />
            <span className="text-white/90">automatically.</span>
          </h1>
          <p className="text-base text-white/70 max-w-sm leading-relaxed">
            LAT generates optimised timetables for every department, resolves
            clashes in seconds, and notifies students of any changes.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: CalendarDays, label: "Automated timetable generation" },
            { icon: CheckCircle2, label: "Real-time conflict detection" },
            { icon: Clock, label: "30-minute email reminders" },
            { icon: Users, label: "Per-student filtered views" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/90" />
              </div>
              <span className="text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-14 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-100 overflow-hidden">
            <Image src="/lasu-logo.png" alt="LASU" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
            LASU — Academic Timetable
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Sign in to LAT</h2>
            <p className="text-sm text-gray-500 mt-1">Admin access only. Enter your credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="admin@lasu.edu.ng"
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm placeholder:text-gray-400 focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 outline-none transition"
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
              className="w-full h-10 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors mt-1"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-400 text-center">
            Lagos State University &middot; Academic Timetable System
          </p>
        </div>
      </div>
    </div>
  );
}
