"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import { RegisterStudentSchema, CourseRegistrationSchema } from "./schema";

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

  return { success: true };
}

async function getStudentIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("studentId")?.value ?? null;
}

export async function registerCourse(raw: unknown): Promise<ActionResult> {
  const studentId = await getStudentIdFromCookie();
  if (!studentId) return { success: false, error: "Not logged in" };

  const parsed = CourseRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid course" };
  }

  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return { success: false, error: "Course not found" };

  await db.studentCourse.upsert({
    where: { studentId_courseId: { studentId, courseId: parsed.data.courseId } },
    create: { studentId, courseId: parsed.data.courseId },
    update: {},
  });

  revalidatePath("/student/timetable");
  revalidatePath("/student/courses");
  return { success: true };
}

export async function unregisterCourse(raw: unknown): Promise<ActionResult> {
  const studentId = await getStudentIdFromCookie();
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
  return { success: true };
}
