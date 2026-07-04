import { db } from "@/lib/db";
import type { LecturerWithCourses } from "./types";

export async function listLecturers(): Promise<LecturerWithCourses[]> {
  return db.lecturer.findMany({
    include: { courses: { include: { course: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getLecturer(id: string): Promise<LecturerWithCourses | null> {
  return db.lecturer.findUnique({
    where: { id },
    include: { courses: { include: { course: true } } },
  });
}
