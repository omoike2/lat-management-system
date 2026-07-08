"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";
import { checkVenueClash, type EntryMinimal } from "@/features/timetable/constraints";
import { sendChangeNotification } from "@/features/notifications/trigger";
import { CreateLecturerSchema, UpdateLecturerSchema, LecturerLoginSchema, ChangeVenueSchema } from "./schema";

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

// --- Lecturer self-service auth (cookie pattern) ---

export async function loginLecturer(raw: unknown): Promise<ActionResult> {
  const parsed = LecturerLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const lecturer = await db.lecturer.findUnique({ where: { email: parsed.data.email } });
  if (!lecturer?.passwordHash) return { success: false, error: "Invalid email or password" };

  const valid = await bcrypt.compare(parsed.data.password, lecturer.passwordHash);
  if (!valid) return { success: false, error: "Invalid email or password" };

  const cookieStore = await cookies();
  cookieStore.set("lecturerId", lecturer.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/lecturer",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return { success: true };
}

export async function logoutLecturer(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("lecturerId");
  redirect("/lecturer/login");
}

export async function changeVenue(raw: unknown): Promise<ActionResult> {
  const cookieStore = await cookies();
  const lecturerId = cookieStore.get("lecturerId")?.value;
  if (!lecturerId) return { success: false, error: "Not logged in" };

  const parsed = ChangeVenueSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { entryId, venueId } = parsed.data;

  const entry = await db.timetableEntry.findUnique({
    where: { id: entryId },
    include: { course: true },
  });
  if (!entry) return { success: false, error: "Entry not found" };
  if (entry.lecturerId !== lecturerId) return { success: false, error: "Unauthorized" };

  const existing: EntryMinimal[] = (
    await db.timetableEntry.findMany({ where: { semester: entry.semester, NOT: { id: entryId } } })
  ).map((e) => ({
    courseId: e.courseId,
    lecturerId: e.lecturerId,
    venueId: e.venueId,
    slotId: e.slotId,
    semester: e.semester,
  }));

  if (checkVenueClash(venueId, entry.slotId, entry.semester, existing)) {
    return { success: false, error: "Venue is already occupied at this time slot" };
  }

  await db.timetableEntry.update({ where: { id: entryId }, data: { venueId } });
  revalidatePath("/lecturer/timetable");

  sendChangeNotification(entryId, "venue", "Your class venue has been changed.").catch(console.error);

  return { success: true };
}
