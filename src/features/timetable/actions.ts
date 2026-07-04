"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import type { ConflictReport } from "./types";
import { generate } from "./generator";
import { GenerateSchema, ManualAssignSchema, UpdateEntrySchema } from "./schema";
import { checkVenueClash, checkLecturerClash, checkGroupClash, type EntryMinimal } from "./constraints";

export async function generateTimetable(
  raw: unknown
): Promise<ActionResult<{ assigned: number; conflicts: ConflictReport[] }>> {
  const parsed = GenerateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { semester } = parsed.data;

  const [courses, venues, slots] = await Promise.all([
    db.course.findMany({ include: { lecturers: { include: { lecturer: true } } } }),
    db.venue.findMany({ orderBy: { capacity: "asc" } }),
    db.timeSlot.findMany({ where: { available: true } }),
  ]);

  if (courses.length === 0) return { success: false, error: "No courses found" };
  if (venues.length === 0) return { success: false, error: "No venues configured" };
  if (slots.length === 0) return { success: false, error: "No available time slots" };

  // Clear existing entries for this semester
  await db.timetableEntry.deleteMany({ where: { semester } });

  const { entries, conflicts } = generate(courses, venues, slots, semester);

  if (entries.length > 0) {
    await db.timetableEntry.createMany({ data: entries });
  }

  revalidatePath("/admin/timetable");
  revalidatePath("/admin/dashboard");

  return { success: true, data: { assigned: entries.length, conflicts } };
}

export async function updateEntry(raw: unknown): Promise<ActionResult> {
  const parsed = UpdateEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { id, ...updates } = parsed.data;
  const entry = await db.timetableEntry.findUnique({
    where: { id },
    include: { course: true, lecturer: true },
  });
  if (!entry) return { success: false, error: "Entry not found" };

  // Validate new slot/venue against hard constraints
  if (updates.slotId || updates.venueId) {
    const targetSlotId = updates.slotId ?? entry.slotId;
    const targetVenueId = updates.venueId ?? entry.venueId;
    const targetLecturerId = updates.lecturerId ?? entry.lecturerId;

    const existing: EntryMinimal[] = (
      await db.timetableEntry.findMany({ where: { semester: entry.semester, NOT: { id } } })
    ).map((e) => ({
      courseId: e.courseId,
      lecturerId: e.lecturerId,
      venueId: e.venueId,
      slotId: e.slotId,
      semester: e.semester,
    }));

    const allCourses = await db.course.findMany({ select: { id: true, department: true, level: true } });
    const courseGroupMap = new Map(allCourses.map((c) => [c.id, { department: c.department, level: c.level }]));

    if (checkVenueClash(targetVenueId, targetSlotId, entry.semester, existing)) {
      return { success: false, error: "Venue is already occupied at this time slot" };
    }
    if (checkLecturerClash([targetLecturerId], targetSlotId, entry.semester, existing)) {
      return { success: false, error: "Lecturer already has a class at this time slot" };
    }
    if (checkGroupClash(entry.course.department, entry.course.level, targetSlotId, entry.semester, existing, courseGroupMap)) {
      return { success: false, error: "This dept/level already has a class at this time slot" };
    }
  }

  await db.timetableEntry.update({ where: { id }, data: updates });
  revalidatePath("/admin/timetable");

  return { success: true };
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  await db.timetableEntry.delete({ where: { id } });
  revalidatePath("/admin/timetable");
  return { success: true };
}

export async function manualAssign(raw: unknown): Promise<ActionResult> {
  const parsed = ManualAssignSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { courseId, lecturerId, venueId, slotId, semester } = parsed.data;

  const existing: EntryMinimal[] = (
    await db.timetableEntry.findMany({ where: { semester } })
  ).map((e) => ({
    courseId: e.courseId,
    lecturerId: e.lecturerId,
    venueId: e.venueId,
    slotId: e.slotId,
    semester: e.semester,
  }));

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, error: "Course not found" };

  const allCourses = await db.course.findMany({ select: { id: true, department: true, level: true } });
  const courseGroupMap = new Map(allCourses.map((c) => [c.id, { department: c.department, level: c.level }]));

  if (checkVenueClash(venueId, slotId, semester, existing)) {
    return { success: false, error: "Venue is already occupied at this time slot" };
  }
  if (checkLecturerClash([lecturerId], slotId, semester, existing)) {
    return { success: false, error: "Lecturer already has a class at this time slot" };
  }
  if (checkGroupClash(course.department, course.level, slotId, semester, existing, courseGroupMap)) {
    return { success: false, error: "This dept/level already has a class at this time slot" };
  }

  await db.timetableEntry.create({
    data: { courseId, lecturerId, venueId, slotId, semester, reminderSent: false },
  });

  revalidatePath("/admin/timetable");
  revalidatePath("/admin/timetable/conflicts");
  return { success: true };
}
