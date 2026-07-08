import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Lecturer } from "@prisma/client";
import type { TimetableEntryWithRelations } from "@/features/timetable/types";
import type { LecturerWithCourses } from "./types";

/** Reads lecturerId cookie, fetches lecturer, redirects to /lecturer/login if missing. */
export async function requireLecturerAuth(): Promise<Lecturer> {
  const cookieStore = await cookies();
  const lecturerId = cookieStore.get("lecturerId")?.value;
  if (!lecturerId) redirect("/lecturer/login");
  const lecturer = await getLecturerById(lecturerId);
  if (!lecturer) redirect("/lecturer/login");
  return lecturer;
}

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

export async function getLecturerById(id: string): Promise<Lecturer | null> {
  return db.lecturer.findUnique({ where: { id } });
}

export async function getLecturerTimetableEntries(
  lecturerId: string,
  semester: string
): Promise<TimetableEntryWithRelations[]> {
  return db.timetableEntry.findMany({
    where: { lecturerId, semester },
    include: { course: true, lecturer: true, venue: true, slot: true },
    orderBy: [{ slot: { dayOfWeek: "asc" } }, { slot: { startTime: "asc" } }],
  });
}
