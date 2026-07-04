"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { SlideOver } from "@/components/slide-over";
import { FormField } from "@/components/form-field";
import { createCourse, deleteCourse } from "@/features/courses/actions";
import type { CourseWithLecturers } from "@/features/courses/types";
import { LEVELS } from "@/types";

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Economics",
  "Law",
];

interface Props {
  courses: CourseWithLecturers[];
}

export default function CoursesClient({ courses }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd);

    startTransition(async () => {
      const result = await createCourse(raw);
      if (result.success) {
        setOpen(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create course");
      }
    });
  }

  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete course "${code}"? This will remove all its timetable entries.`)) return;
    startTransition(async () => {
      await deleteCourse(id);
      router.refresh();
    });
  }

  const columns: Column<CourseWithLecturers>[] = [
    { key: "code", header: "Code", sortable: true, cell: (r) => <span className="font-medium">{r.code}</span> },
    { key: "title", header: "Title", sortable: true, cell: (r) => r.title },
    { key: "department", header: "Dept", sortable: true, cell: (r) => r.department },
    { key: "level", header: "Level", sortable: true, cell: (r) => r.level },
    { key: "units", header: "Units", cell: (r) => r.units },
    { key: "lecturers", header: "Lecturers", cell: (r) => r.lecturers.length },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => router.push(`/admin/courses/${r.id}`)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-bg) transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(r.id, r.code)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-danger-light) hover:text-(--color-danger) transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-(--color-text-primary)">Courses</h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">{courses.length} total</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) transition-colors"
        >
          <Plus size={16} /> Add course
        </button>
      </div>

      <DataTable
        data={courses}
        columns={columns}
        searchPlaceholder="Search courses…"
        searchKeys={["code", "title", "department"]}
        emptyMessage="No courses yet. Add one to get started."
      />

      <SlideOver
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Add course"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); }}
              className="h-9 px-4 rounded-md border border-(--color-border) text-sm font-medium text-(--color-text-primary) hover:bg-(--color-bg) transition-colors"
            >
              Cancel
            </button>
            <button
              form="course-form"
              type="submit"
              disabled={isPending}
              className="h-9 px-4 rounded-md bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-hover) disabled:opacity-60 transition-colors"
            >
              {isPending ? "Creating…" : "Create"}
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField id="code" label="Course code" required>
            <input id="code" name="code" required placeholder="e.g. CSC 201" className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>

          <FormField id="title" label="Title" required>
            <input id="title" name="title" required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
          </FormField>

          <FormField id="department" label="Department" required>
            <select id="department" name="department" required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none bg-white">
              <option value="">Select…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>

          <FormField id="level" label="Level" required>
            <select id="level" name="level" required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none bg-white">
              <option value="">Select…</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="units" label="Units" required>
              <input id="units" name="units" type="number" min={1} max={6} defaultValue={3} required className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
            </FormField>
            <FormField id="weeklyFreq" label="Weekly freq">
              <input id="weeklyFreq" name="weeklyFreq" type="number" min={1} max={5} defaultValue={2} className="w-full h-9 rounded-md border border-(--color-border) px-3 text-sm focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) outline-none" />
            </FormField>
          </div>

          {error && <p className="text-xs text-(--color-danger)">{error}</p>}
        </form>
      </SlideOver>
    </div>
  );
}
