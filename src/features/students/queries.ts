import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Course, Student } from "@prisma/client";

/** Reads studentId cookie, fetches student, redirects to /student/register if missing. */
export async function requireStudentAuth(): Promise<Student> {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("studentId")?.value;
  if (!studentId) redirect("/student/register");
  const student = await getStudentById(studentId);
  if (!student) redirect("/student/register");
  return student;
}

export async function getStudentByMatric(matric: string): Promise<Student | null> {
  return db.student.findUnique({ where: { matric } });
}

export async function getStudentById(id: string): Promise<Student | null> {
  return db.student.findUnique({ where: { id } });
}

export async function listDepartmentsForStudent(): Promise<string[]> {
  const rows = await db.course.findMany({
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department);
}

export async function getRegisteredCourseIds(studentId: string): Promise<string[]> {
  const rows = await db.studentCourse.findMany({
    where: { studentId },
    select: { courseId: true },
  });
  return rows.map((r) => r.courseId);
}

export async function listCoursesForRegistration(): Promise<Course[]> {
  return db.course.findMany({ orderBy: [{ department: "asc" }, { level: "asc" }, { code: "asc" }] });
}

/** All courses a student is studying: dept+level courses plus any explicitly registered extras. */
export async function getStudentCourses(
  studentId: string,
  department: string,
  level: number
): Promise<Course[]> {
  const [deptCourses, registrations] = await Promise.all([
    db.course.findMany({ where: { department, level }, orderBy: { code: "asc" } }),
    db.studentCourse.findMany({
      where: { studentId, NOT: { course: { department, level } } },
      include: { course: true },
    }),
  ]);
  return [...deptCourses, ...registrations.map((r) => r.course)];
}
