import { z } from "zod";

export const CreateLecturerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email required"),
  department: z.string().optional(),
});

export const UpdateLecturerSchema = CreateLecturerSchema.extend({
  id: z.string().cuid(),
});

export type CreateLecturerInput = z.infer<typeof CreateLecturerSchema>;
export type UpdateLecturerInput = z.infer<typeof UpdateLecturerSchema>;
