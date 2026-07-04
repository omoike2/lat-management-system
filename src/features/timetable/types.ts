import type { Course, Lecturer, Venue, TimeSlot, TimetableEntry } from "@prisma/client";

export type ConflictReport = {
  courseId: string;
  courseCode: string;
  reason: "NO_VENUE_AVAILABLE" | "LECTURER_UNAVAILABLE" | "GROUP_CLASH";
  triedSlots: number;
};

export type GenerationResult = {
  entries: Omit<TimetableEntry, "id" | "createdAt" | "updatedAt">[];
  conflicts: ConflictReport[];
};

export type CourseForGeneration = Course & {
  lecturers: { lecturer: Lecturer }[];
};

export type GeneratorInput = {
  courses: CourseForGeneration[];
  venues: Venue[];
  slots: TimeSlot[];
  semester: string;
};

export type TimetableEntryWithRelations = TimetableEntry & {
  course: Course;
  lecturer: Lecturer;
  venue: Venue;
  slot: TimeSlot;
};

export type GridEntry = {
  entry: TimetableEntryWithRelations;
  isConflict: boolean;
};
