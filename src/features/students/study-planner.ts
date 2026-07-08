import type { TimeSlot } from "@prisma/client";
import type { TimetableEntryWithRelations } from "@/types";

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

function addBlock(
  blocks: StudyBlock[],
  taken: Set<string>,
  course: CourseSummary,
  slot: TimeSlot
): void {
  blocks.push({ courseId: course.id, courseCode: course.code, courseTitle: course.title, slotId: slot.id });
  taken.add(slot.id);
}

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
  const takenByStudy = new Set<string>();

  for (const course of courses) {
    let remaining = course.units;
    const usedDays = new Set<number>();

    // Pass 1: one block per day to spread across the week
    for (const slot of availableSlots) {
      if (remaining === 0) break;
      if (usedDays.has(slot.dayOfWeek) || takenByStudy.has(slot.id)) continue;
      addBlock(blocks, takenByStudy, course, slot);
      usedDays.add(slot.dayOfWeek);
      remaining--;
    }

    // Pass 2: fill remaining units without the day-spread constraint
    for (const slot of availableSlots) {
      if (remaining === 0) break;
      if (takenByStudy.has(slot.id)) continue;
      addBlock(blocks, takenByStudy, course, slot);
      remaining--;
    }
  }

  return blocks;
}
