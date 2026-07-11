"use client";

import { GraduationCap } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import type { Student } from "@prisma/client";

type StudentWithCount = Student & { _count: { courses: number } };

interface Props {
  students: StudentWithCount[];
}

export default function StudentsClient({ students }: Props) {
  const columns: Column<StudentWithCount>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "matric",
      header: "Matric",
      sortable: true,
      cell: (r) => <span className="font-mono text-xs">{r.matric}</span>,
    },
    { key: "email", header: "Email", sortable: true, cell: (r) => r.email },
    { key: "department", header: "Department", sortable: true, cell: (r) => r.department },
    { key: "level", header: "Level", sortable: true, cell: (r) => r.level },
    {
      key: "courses",
      header: "Extra Courses",
      cell: (r) => r._count.courses,
    },
    {
      key: "createdAt",
      header: "Registered",
      sortable: true,
      cell: (r) =>
        new Date(r.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-(--color-text-primary)">Students</h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">{students.length} registered</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-50">
          <GraduationCap size={18} className="text-teal-600" />
        </div>
      </div>

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Search by name, matric, email, or department…"
        searchKeys={["name", "matric", "email", "department"]}
        emptyMessage="No students registered yet."
      />
    </div>
  );
}
