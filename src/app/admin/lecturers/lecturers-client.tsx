"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { SlideOver } from "@/components/slide-over";
import { FormField } from "@/components/form-field";
import { createLecturer, deleteLecturer } from "@/features/lecturers/actions";
import type { LecturerWithCourses } from "@/features/lecturers/types";

interface Props {
  lecturers: LecturerWithCourses[];
}

export default function LecturersClient({ lecturers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    startTransition(async () => {
      const result = await createLecturer(raw);
      if (result.success) {
        setOpen(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create lecturer");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete lecturer "${name}"? They will be unassigned from all courses.`)) return;
    startTransition(async () => {
      await deleteLecturer(id);
      router.refresh();
    });
  }

  const columns: Column<LecturerWithCourses>[] = [
    { key: "name", header: "Name", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", sortable: true, cell: (r) => r.email },
    { key: "department", header: "Dept", sortable: true, cell: (r) => r.department ?? "—" },
    { key: "courses", header: "Courses", cell: (r) => r.courses.length },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => router.push(`/admin/lecturers/${r.id}`)} className="h-8 w-8 rounded-md flex items-center justify-center text-[--color-text-muted] hover:bg-[--color-bg] transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(r.id, r.name)} className="h-8 w-8 rounded-md flex items-center justify-center text-[--color-text-muted] hover:bg-[--color-danger-light] hover:text-[--color-danger] transition-colors">
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
          <h1 className="text-2xl font-semibold text-[--color-text-primary]">Lecturers</h1>
          <p className="text-sm text-[--color-text-secondary] mt-1">{lecturers.length} total</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-md bg-[--color-brand] text-white text-sm font-medium hover:bg-[--color-brand-hover] transition-colors">
          <Plus size={16} /> Add lecturer
        </button>
      </div>

      <DataTable data={lecturers} columns={columns} searchPlaceholder="Search lecturers…" searchKeys={["name", "email", "department"]} emptyMessage="No lecturers yet." />

      <SlideOver
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Add lecturer"
        footer={
          <>
            <button type="button" onClick={() => { setOpen(false); setError(null); }} className="h-9 px-4 rounded-md border border-[--color-border] text-sm font-medium text-[--color-text-primary] hover:bg-[--color-bg] transition-colors">Cancel</button>
            <button form="lecturer-form" type="submit" disabled={isPending} className="h-9 px-4 rounded-md bg-[--color-brand] text-white text-sm font-medium hover:bg-[--color-brand-hover] disabled:opacity-60 transition-colors">{isPending ? "Creating…" : "Create"}</button>
          </>
        }
      >
        <form id="lecturer-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField id="name" label="Name" required>
            <input id="name" name="name" required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
          </FormField>
          <FormField id="email" label="Email" required>
            <input id="email" name="email" type="email" required className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
          </FormField>
          <FormField id="department" label="Department">
            <input id="department" name="department" placeholder="Optional" className="w-full h-9 rounded-md border border-[--color-border] px-3 text-sm focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none" />
          </FormField>
          {error && <p className="text-xs text-[--color-danger]">{error}</p>}
        </form>
      </SlideOver>
    </div>
  );
}
