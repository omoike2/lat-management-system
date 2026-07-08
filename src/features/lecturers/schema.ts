import { z } from "zod";

export const CreateLecturerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email required"),
  department: z.string().optional(),
});

export const UpdateLecturerSchema = CreateLecturerSchema.extend({
  id: z.string().cuid(),
});

export const LecturerLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

export const ChangeVenueSchema = z.object({
  entryId: z.string().cuid("Invalid entry ID"),
  venueId: z.string().cuid("Invalid venue ID"),
});

export type CreateLecturerInput = z.infer<typeof CreateLecturerSchema>;
export type UpdateLecturerInput = z.infer<typeof UpdateLecturerSchema>;
export type LecturerLoginInput = z.infer<typeof LecturerLoginSchema>;
export type ChangeVenueInput = z.infer<typeof ChangeVenueSchema>;
