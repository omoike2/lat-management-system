import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations } from "@/features/timetable/types";

export type StudyBlock = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  slotId: string;
};

type CourseSummary = {
  id: string;
  code: string;
  title: string;
  units: number;
};

/**
 * Generates a personal study timetable by filling free slots with study blocks.
 * Allocates `course.units` blocks per course, spread across different days.
 * Pure function — no DB calls.
 */
export function planStudyTimetable(
  courses: CourseSummary[],
  classEntries: TimetableEntryWithRelations[],
  allSlots: TimeSlot[]
): StudyBlock[] {
  const occupiedSlotIds = new Set(classEntries.map((e) => e.slotId));
  const availableSlots = allSlots.filter((s) => s.available && !occupiedSlotIds.has(s.id));

  const blocks: StudyBlock[] = [];

  for (const course of courses) {
    let remaining = course.units;
    // Track days already used for this course to spread across the week
    const usedDays = new Set<number>();

    for (const slot of availableSlots) {
      if (remaining === 0) break;
      // Skip if this day already has a study block for this course
      if (usedDays.has(slot.dayOfWeek)) continue;
      // Skip if this slot is already taken by another study block
      if (blocks.some((b) => b.slotId === slot.id)) continue;

      blocks.push({
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        slotId: slot.id,
      });
      usedDays.add(slot.dayOfWeek);
      remaining--;
    }

    // If we ran out of day-spread slots, fill remaining without day restriction
    if (remaining > 0) {
      for (const slot of availableSlots) {
        if (remaining === 0) break;
        if (blocks.some((b) => b.slotId === slot.id)) continue;
        blocks.push({
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          slotId: slot.id,
        });
        remaining--;
      }
    }
  }

  return blocks;
}
