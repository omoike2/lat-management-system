import { db } from "@/lib/db";
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
