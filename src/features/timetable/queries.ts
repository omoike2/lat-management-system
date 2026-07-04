import { db } from "@/lib/db";
import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations } from "./types";

export async function getEntriesForSemester(semester: string): Promise<TimetableEntryWithRelations[]> {
  return db.timetableEntry.findMany({
    where: { semester },
    include: {
      course: true,
      lecturer: true,
      venue: true,
      slot: true,
    },
    orderBy: [{ slot: { dayOfWeek: "asc" } }, { slot: { startTime: "asc" } }],
  });
}

export async function getLastGenerationInfo(): Promise<{
  semester: string;
  count: number;
  updatedAt: Date;
} | null> {
  const entry = await db.timetableEntry.findFirst({
    orderBy: { createdAt: "desc" },
    select: { semester: true, createdAt: true },
  });
  if (!entry) return null;

  const count = await db.timetableEntry.count({ where: { semester: entry.semester } });
  return { semester: entry.semester, count, updatedAt: entry.createdAt };
}

export async function listSemesters(): Promise<string[]> {
  const rows = await db.timetableEntry.findMany({
    select: { semester: true },
    distinct: ["semester"],
    orderBy: { semester: "desc" },
  });
  return rows.map((r) => r.semester);
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
  return db.timeSlot.findMany({
    orderBy: [{ startTime: "asc" }, { dayOfWeek: "asc" }],
  });
}

export async function getTimetableSummary(semester: string): Promise<{ entryCount: number }> {
  const entryCount = await db.timetableEntry.count({ where: { semester } });
  return { entryCount };
}

export async function getStudentTimetableEntries(
  department: string,
  level: number,
  semester: string
): Promise<TimetableEntryWithRelations[]> {
  return db.timetableEntry.findMany({
    where: { semester, course: { department, level } },
    include: { course: true, lecturer: true, venue: true, slot: true },
    orderBy: [{ slot: { dayOfWeek: "asc" } }, { slot: { startTime: "asc" } }],
  });
}
