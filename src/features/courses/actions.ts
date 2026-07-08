"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types";
import { CreateCourseSchema, UpdateCourseSchema } from "./schema";

export async function createCourse(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const deny = await requireAdmin();
  if (deny) return deny;

  const parsed = CreateCourseSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const existing = await db.course.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { success: false, error: `Course code "${parsed.data.code}" already exists` };

  const course = await db.course.create({ data: parsed.data });
  revalidatePath("/admin/courses");
  return { success: true, data: { id: course.id } };
}

export async function updateCourse(raw: unknown): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  const parsed = UpdateCourseSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { id, ...data } = parsed.data;
  const existing = await db.course.findFirst({
    where: { code: data.code, NOT: { id } },
  });
  if (existing) return { success: false, error: `Course code "${data.code}" already in use` };

  await db.course.update({ where: { id }, data });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return { success: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  await db.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function assignLecturer(courseId: string, lecturerId: string): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  await db.lecturerCourse.upsert({
    where: { lecturerId_courseId: { lecturerId, courseId } },
    create: { lecturerId, courseId },
    update: {},
  });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function unassignLecturer(courseId: string, lecturerId: string): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  await db.lecturerCourse.delete({
    where: { lecturerId_courseId: { lecturerId, courseId } },
  });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}
