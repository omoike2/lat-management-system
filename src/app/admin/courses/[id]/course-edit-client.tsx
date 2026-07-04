"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { FormField } from "@/components/form-field";
import { updateCourse, assignLecturer, unassignLecturer } from "@/features/courses/actions";
import type { CourseWithLecturers } from "@/features/courses/types";
import type { LecturerWithCourses } from "@/features/lecturers/types";
import { LEVELS } from "@/types";

const DEPARTMENTS = [
  "Computer Science", "Mathematics", "Physics", "Chemistry",
  "Biology", "Engineering", "Economics", "Law",
];

interface Props {
  course: CourseWithLecturers;
  allLecturers: LecturerWithCourses[];
}

export default function CourseEditClient({ course, allLecturers }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const assigned = new Set(course.lecturers.map((lc) => lc.lecturer.id));
  const unassigned = allLecturers.filter((l) => !assigned.has(l.id));

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = { ...Object.fromEntries(fd), id: course.id };

    startTransition(async () => {
      const result = await updateCourse(raw);
      if (result.success) {
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error ?? "Update failed");
      }
    });
  }

  function handleAssign(lecturerId: string) {
    startTransition(async () => {
      await assignLecturer(course.id, lecturerId);
      router.refresh();
    });
  }

  function handleUnassign(lecturerId: string) {
    startTransition(async () => {
      await unassignLecturer(course.id, lecturerId);
      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/courses")}
        className="flex items-center gap-2 text-sm text-[--color-text-secondary] hover:text-[--color-text-primary] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Courses
      </button>

      <h1 className="text-2xl font-semibold text-[--color-text-primary] mb-1">{course.code}</h1>
      <p className="text-sm text-[--color-text-secondary] mb-6">{course.title}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Edit form */}
        <div className="bg-white rounded-lg border border-[--color-border] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[--color-text-primary] mb-4">Details</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField id="code" label="Course code" required>
              <input id="code" name="code" defaultValue={course.code} required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
            </FormField>
            <FormField id="title" label="Title" required>
              <input id="title" name="title" defaultValue={course.title} required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
            </FormField>
            <FormField id="department" label="Department" required>
              <select id="department" name="department" defaultValue={course.department} required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none bg-white">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField id="level" label="Level" required>
              <select id="level" name="level" defaultValue={course.level} required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none bg-white">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField id="units" label="Units" required>
                <input id="units" name="units" type="number" min={1} max={6} defaultValue={course.units} required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
              </FormField>
              <FormField id="weeklyFreq" label="Weekly freq">
                <input id="weeklyFreq" name="weeklyFreq" type="number" min={1} max={5} defaultValue={course.weeklyFreq} className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
              </FormField>
            </div>

            {error && <p className="text-xs text-[--color-danger]">{error}</p>}
            {success && <p className="text-xs text-[--color-success]">Saved.</p>}

            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 rounded-md bg-[--color-brand] text-white text-sm font-medium hover:bg-[--color-brand-hover] disabled:opacity-60 transition-colors"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>

        {/* Lecturer assignment */}
        <div className="bg-white rounded-lg border border-[--color-border] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[--color-text-primary] mb-4">Lecturers</h2>

          {course.lecturers.length === 0 ? (
            <p className="text-sm text-[--color-text-muted] mb-4">No lecturers assigned.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {course.lecturers.map(({ lecturer }) => (
                <li key={lecturer.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-[--color-text-primary]">{lecturer.name}</span>
                    <span className="text-[--color-text-muted] ml-2">{lecturer.email}</span>
                  </div>
                  <button
                    onClick={() => handleUnassign(lecturer.id)}
                    disabled={isPending}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-[--color-text-muted] hover:bg-[--color-danger-light] hover:text-[--color-danger] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {unassigned.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[--color-text-secondary] mb-2">Assign lecturer</p>
              <select
                onChange={(e) => { if (e.target.value) handleAssign(e.target.value); e.target.value = ""; }}
                className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none bg-white"
              >
                <option value="">Select lecturer…</option>
                {unassigned.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} — {l.department ?? "No dept"}</option>
                ))}
              </select>
            </div>
          )}

          {unassigned.length === 0 && course.lecturers.length > 0 && (
            <p className="text-xs text-[--color-text-muted]">All lecturers assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
