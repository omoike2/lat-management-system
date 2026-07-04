"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import { RegisterStudentSchema } from "./schema";

export async function registerStudent(raw: unknown): Promise<ActionResult<{ id: string; matric: string }>> {
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
  return { success: true, data: { id: student.id, matric: student.matric } };
}
