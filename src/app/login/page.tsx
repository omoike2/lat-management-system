"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-[--color-bg] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[--color-brand] mb-4">
            <span className="text-white text-xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-[--color-text-primary]">LAT System</h1>
          <p className="text-sm text-[--color-text-secondary] mt-1">Admin sign in</p>
        </div>

        <div className="bg-white rounded-lg border border-[--color-border] shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[--color-text-primary]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-[--color-text-primary]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-[--color-danger]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-9 rounded-md bg-[--color-brand] text-white text-sm font-medium hover:bg-[--color-brand-hover] disabled:opacity-60 transition-colors"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
