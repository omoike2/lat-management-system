import { db } from "@/lib/db";
import type { CourseWithLecturers } from "./types";

export async function listCourses(): Promise<CourseWithLecturers[]> {
  return db.course.findMany({
    include: {
      lecturers: { include: { lecturer: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { code: "asc" },
  });
}

export async function getCourse(id: string): Promise<CourseWithLecturers | null> {
  return db.course.findUnique({
    where: { id },
    include: {
      lecturers: { include: { lecturer: true } },
      _count: { select: { entries: true } },
    },
  });
}

export async function listDepartments(): Promise<string[]> {
  const rows = await db.course.findMany({
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department);
}
