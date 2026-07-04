"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";
import { CreateLecturerSchema, UpdateLecturerSchema } from "./schema";

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  return null;
}

export async function createLecturer(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = CreateLecturerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const existing = await db.lecturer.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, error: `Email "${parsed.data.email}" already exists` };

  const lecturer = await db.lecturer.create({ data: parsed.data });
  revalidatePath("/admin/lecturers");
  return { success: true, data: { id: lecturer.id } };
}

export async function updateLecturer(raw: unknown): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  const parsed = UpdateLecturerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { id, ...data } = parsed.data;
  const existing = await db.lecturer.findFirst({
    where: { email: data.email, NOT: { id } },
  });
  if (existing) return { success: false, error: `Email "${data.email}" already in use` };

  await db.lecturer.update({ where: { id }, data });
  revalidatePath("/admin/lecturers");
  revalidatePath(`/admin/lecturers/${id}`);
  return { success: true };
}

export async function deleteLecturer(id: string): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  await db.lecturer.delete({ where: { id } });
  revalidatePath("/admin/lecturers");
  return { success: true };
}
