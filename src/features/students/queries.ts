import { db } from "@/lib/db";
import type { Student } from "@prisma/client";

export async function getStudentByMatric(matric: string): Promise<Student | null> {
  return db.student.findUnique({ where: { matric } });
}

export async function getStudentById(id: string): Promise<Student | null> {
  return db.student.findUnique({ where: { id } });
}

export async function listDepartmentsForStudent(): Promise<string[]> {
  const rows = await db.course.findMany({
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department);
}
