import type { Venue } from "@prisma/client";

export type VenueWithCount = Venue & {
  _count: { entries: number };
};
