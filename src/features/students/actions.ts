"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import { RegisterStudentSchema, CourseRegistrationSchema } from "./schema";
import { sendWelcomeEmail, sendCourseRegistrationEmail } from "@/features/notifications/trigger";

export async function registerStudent(raw: unknown): Promise<ActionResult> {
  const parsed = RegisterStudentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { name, email, matric, department, level } = parsed.data;

  const byMatric = await db.student.findUnique({ where: { matric } });
  if (byMatric) return { success: false, error: "Matric number already registered" };

  const byEmail = await db.student.findUnique({ where: { email } });
  if (byEmail) return { success: false, error: "Email already registered" };

  const student = await db.student.create({ data: { name, email, matric, department, level } });

  // Set httpOnly + secure cookie — UUID is unguessable, not returned to client
  const cookieStore = await cookies();
  cookieStore.set("studentId", student.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/student",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Fire-and-forget — don't block registration on email delivery
  sendWelcomeEmail(student.name, student.email, student.department, student.level).catch(
    (err) => console.error("[email] welcome send failed:", err)
  );

  return { success: true };
}

export async function logoutStudent(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "studentId", path: "/student" });
  redirect("/student/register");
}

async function getStudentId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("studentId")?.value ?? null;
}

export async function registerCourse(raw: unknown): Promise<ActionResult> {
  const studentId = await getStudentId();
  if (!studentId) return { success: false, error: "Not logged in" };

  const parsed = CourseRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid course" };
  }

  await db.studentCourse.upsert({
    where: { studentId_courseId: { studentId, courseId: parsed.data.courseId } },
    create: { studentId, courseId: parsed.data.courseId },
    update: {},
  });

  revalidatePath("/student/timetable");
  revalidatePath("/student/courses");

  (async () => {
    const [student, course] = await Promise.all([
      db.student.findUnique({ where: { id: studentId }, select: { name: true, email: true } }),
      db.course.findUnique({ where: { id: parsed.data.courseId }, select: { code: true, title: true } }),
    ]);
    if (student && course) {
      await sendCourseRegistrationEmail(student.name, student.email, course.code, course.title, "registered");
    }
  })().catch((err) => console.error("[email] course register send failed:", err));

  return { success: true };
}

export async function unregisterCourse(raw: unknown): Promise<ActionResult> {
  const studentId = await getStudentId();
  if (!studentId) return { success: false, error: "Not logged in" };

  const parsed = CourseRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid course" };
  }

  await db.studentCourse.deleteMany({
    where: { studentId, courseId: parsed.data.courseId },
  });

  revalidatePath("/student/timetable");
  revalidatePath("/student/courses");

  (async () => {
    const [student, course] = await Promise.all([
      db.student.findUnique({ where: { id: studentId }, select: { name: true, email: true } }),
      db.course.findUnique({ where: { id: parsed.data.courseId }, select: { code: true, title: true } }),
    ]);
    if (student && course) {
      await sendCourseRegistrationEmail(student.name, student.email, course.code, course.title, "unregistered");
    }
  })().catch((err) => console.error("[email] course unregister send failed:", err));

  return { success: true };
}
