import type { TimetableEntry } from "@prisma/client";

export type EntryMinimal = Pick<TimetableEntry, "venueId" | "slotId" | "lecturerId" | "courseId" | "semester">;

export type CourseGroup = { department: string; level: number };

/** True = clash detected (venue already occupied at this slot/semester). */
export function checkVenueClash(
  venueId: string,
  slotId: string,
  semester: string,
  existing: EntryMinimal[]
): boolean {
  return existing.some(
    (e) => e.venueId === venueId && e.slotId === slotId && e.semester === semester
  );
}

/** True = clash detected (one of the lecturers already teaches at this slot/semester). */
export function checkLecturerClash(
  lecturerIds: string[],
  slotId: string,
  semester: string,
  existing: EntryMinimal[]
): boolean {
  const idSet = new Set(lecturerIds);
  return existing.some(
    (e) => idSet.has(e.lecturerId) && e.slotId === slotId && e.semester === semester
  );
}

/**
 * True = clash detected (another course for the same dept+level is already
 * scheduled in this slot/semester).
 *
 * @param courseGroupMap  courseId → { department, level } for ALL courses
 */
export function checkGroupClash(
  department: string,
  level: number,
  slotId: string,
  semester: string,
  existing: EntryMinimal[],
  courseGroupMap: Map<string, CourseGroup>
): boolean {
  return existing.some((e) => {
    if (e.slotId !== slotId || e.semester !== semester) return false;
    const group = courseGroupMap.get(e.courseId);
    return group?.department === department && group?.level === level;
  });
}
