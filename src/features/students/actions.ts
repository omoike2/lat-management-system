"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import { z } from "zod";
import { RegisterStudentSchema, CourseRegistrationSchema } from "./schema";
import { sendWelcomeEmail, sendCourseRegistrationEmail } from "@/features/notifications/trigger";
import { rateLimit } from "@/lib/rate-limit";

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

export async function loginStudent(raw: unknown): Promise<ActionResult> {
  const parsed = z.object({ matric: z.string().min(1, "Matric number is required") }).safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  // Rate-limit: 5 attempts per IP per 15 min, 10 per matric per 15 min
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const matric = parsed.data.matric;

  if (!rateLimit(`login:ip:${ip}`, 5, 15 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Try again in 15 minutes." };
  }
  if (!rateLimit(`login:matric:${matric}`, 10, 15 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  // TODO: upgrade to email OTP — matric alone is a weak factor; low risk (data = timetable only)
  // Plan: requestLoginOtp(matric) emails a 6-digit code; verifyLoginOtp(matric, code) sets cookie.
  const student = await db.student.findUnique({ where: { matric } });
  // Generic message regardless of whether matric exists — prevents enumeration
  if (!student) return { success: false, error: "Invalid matric number" };

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
