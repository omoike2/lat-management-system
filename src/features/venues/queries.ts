import { db } from "@/lib/db";
import type { VenueWithCount } from "./types";

export async function listVenues(): Promise<VenueWithCount[]> {
  return db.venue.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getVenue(id: string): Promise<VenueWithCount | null> {
  return db.venue.findUnique({
    where: { id },
    include: { _count: { select: { entries: true } } },
  });
}
