"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";
import { CreateVenueSchema, UpdateVenueSchema } from "./schema";

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  return null;
}

export async function createVenue(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = CreateVenueSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const existing = await db.venue.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { success: false, error: `Venue "${parsed.data.name}" already exists` };

  const venue = await db.venue.create({ data: parsed.data });
  revalidatePath("/admin/venues");
  return { success: true, data: { id: venue.id } };
}

export async function updateVenue(raw: unknown): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  const parsed = UpdateVenueSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const { id, ...data } = parsed.data;
  const existing = await db.venue.findFirst({
    where: { name: data.name, NOT: { id } },
  });
  if (existing) return { success: false, error: `Venue name "${data.name}" already in use` };

  await db.venue.update({ where: { id }, data });
  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${id}`);
  return { success: true };
}

export async function deleteVenue(id: string): Promise<ActionResult> {
  const deny = await requireAdmin();
  if (deny) return deny;

  const active = await db.timetableEntry.count({ where: { venueId: id } });
  if (active > 0) {
    return { success: false, error: `Cannot delete: venue has ${active} active timetable entries` };
  }

  await db.venue.delete({ where: { id } });
  revalidatePath("/admin/venues");
  return { success: true };
}
