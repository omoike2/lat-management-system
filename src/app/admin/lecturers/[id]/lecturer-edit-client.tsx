"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormField } from "@/components/form-field";
import { updateLecturer } from "@/features/lecturers/actions";
import type { LecturerWithCourses } from "@/features/lecturers/types";

export default function LecturerEditClient({ lecturer }: { lecturer: LecturerWithCourses }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = { ...Object.fromEntries(new FormData(e.currentTarget)), id: lecturer.id };
    startTransition(async () => {
      const result = await updateLecturer(raw);
      if (result.success) {
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error ?? "Update failed");
      }
    });
  }

  return (
    <div>
      <button onClick={() => router.push("/admin/lecturers")} className="flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) mb-6 transition-colors">
        <ArrowLeft size={16} /> Lecturers
      </button>

      <h1 className="text-2xl font-semibold text-(--color-text-primary) mb-6">{lecturer.name}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-(--color-border) shadow-sm p-6">
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="name" label="Name" required>
              <input id="name" name="name" defaultValue={lecturer.name} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
            </FormField>
            <FormField id="email" label="Email" required>
              <input id="email" name="email" type="email" defaultValue={lecturer.email} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
            </FormField>
            <FormField id="department" label="Department">
              <input id="department" name="department" defaultValue={lecturer.department ?? ""} placeholder="Optional" className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
            </FormField>
            {error && <p className="text-xs text-(--color-danger)">{error}</p>}
            {success && <p className="text-xs text-(--color-success)">Saved.</p>}
            <button type="submit" disabled={isPending} className="h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors">
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-(--color-border) shadow-sm p-6">
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">Assigned courses</h2>
          {lecturer.courses.length === 0 ? (
            <p className="text-sm text-(--color-text-muted)">No courses assigned.</p>
          ) : (
            <ul className="space-y-2">
              {lecturer.courses.map(({ course }) => (
                <li key={course.id} className="text-sm">
                  <span className="font-medium text-(--color-text-primary)">{course.code}</span>
                  <span className="text-(--color-text-muted) ml-2">{course.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
