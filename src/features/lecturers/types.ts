import type { Lecturer, Course } from "@prisma/client";

export type LecturerWithCourses = Lecturer & {
  courses: { course: Course }[];
};
