import { z } from "zod";
import { VenueType } from "@prisma/client";

export const CreateVenueSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  type: z.nativeEnum(VenueType),
});

export const UpdateVenueSchema = CreateVenueSchema.extend({
  id: z.string().cuid(),
});

export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;
