import type { Course, Lecturer } from "@prisma/client";

export type CourseWithLecturers = Course & {
  lecturers: { lecturer: Lecturer }[];
  _count: { entries: number };
};
