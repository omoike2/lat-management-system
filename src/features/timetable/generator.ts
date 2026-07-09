import type { Venue, TimeSlot } from "@prisma/client";
import {
  checkVenueClash,
  checkLecturerClash,
  checkGroupClash,
  type EntryMinimal,
  type CourseGroup,
} from "./constraints";
import type { CourseForGeneration, GenerationResult } from "./types";

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Higher density = more constrained = schedule first. */
function constraintDensity(
  course: CourseForGeneration,
  allCourses: CourseForGeneration[]
): number {
  const lecturerCount = course.lecturers.length;
  const groupCount = allCourses.filter(
    (c) => c.department === course.department && c.level === course.level
  ).length;
  return lecturerCount + groupCount;
}

export function generate(
  courses: CourseForGeneration[],
  venues: Venue[],
  slots: TimeSlot[],
  semester: string,
  existingEntries: EntryMinimal[] = []
): GenerationResult {
  const courseGroupMap = new Map<string, CourseGroup>(
    courses.map((c) => [c.id, { department: c.department, level: c.level }])
  );

  const availableSlots = slots.filter((s) => s.available);
  const sortedVenues = [...venues].sort((a, b) => a.capacity - b.capacity);

  const sorted = [...courses].sort(
    (a, b) => constraintDensity(b, courses) - constraintDensity(a, courses)
  );

  const assigned: EntryMinimal[] = [...existingEntries];
  const result: GenerationResult = { entries: [], conflicts: [] };
  // Track how many entries each venue has been assigned — prefer least-loaded
  const venueLoad = new Map<string, number>(sortedVenues.map((v) => [v.id, 0]));

  for (const course of sorted) {
    const lecturerIds = course.lecturers.map((lc) => lc.lecturer.id);
    if (lecturerIds.length === 0) {
      result.conflicts.push({
        courseId: course.id,
        courseCode: course.code,
        reason: "LECTURER_UNAVAILABLE",
        triedSlots: 0,
      });
      continue;
    }

    // weeklyFreq determines how many slots to assign per course
    const needed = course.weeklyFreq;
    let placed = 0;
    const triedSlots = shuffled(availableSlots);

    for (const slot of triedSlots) {
      if (placed >= needed) break;

      const venueClash = (venueId: string) =>
        checkVenueClash(venueId, slot.id, semester, assigned);
      const lecturerClash = checkLecturerClash(lecturerIds, slot.id, semester, assigned);
      const groupClash = checkGroupClash(
        course.department,
        course.level,
        slot.id,
        semester,
        assigned,
        courseGroupMap
      );

      if (lecturerClash || groupClash) continue;

      // Pick the least-loaded venue with no clash; capacity order breaks ties
      const venue = sortedVenues
        .filter((v) => !venueClash(v.id))
        .sort((a, b) => venueLoad.get(a.id)! - venueLoad.get(b.id)!)[0];
      if (!venue) continue;
      venueLoad.set(venue.id, venueLoad.get(venue.id)! + 1);

      const entry: EntryMinimal = {
        courseId: course.id,
        lecturerId: lecturerIds[0],
        venueId: venue.id,
        slotId: slot.id,
        semester,
      };

      assigned.push(entry);
      result.entries.push({ ...entry, reminderSent: false });
      placed++;
    }

    if (placed === 0) {
      result.conflicts.push({
        courseId: course.id,
        courseCode: course.code,
        reason: "NO_VENUE_AVAILABLE",
        triedSlots: triedSlots.length,
      });
    }
  }

  return result;
}
