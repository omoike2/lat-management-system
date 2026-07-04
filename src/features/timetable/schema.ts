import { z } from "zod";

export const GenerateSchema = z.object({
  semester: z.string().min(1, "Semester is required"),
});

export const ManualAssignSchema = z.object({
  courseId: z.string().cuid(),
  lecturerId: z.string().cuid(),
  venueId: z.string().cuid(),
  slotId: z.string().cuid(),
  semester: z.string().min(1),
});

export const UpdateEntrySchema = z.object({
  id: z.string().cuid(),
  venueId: z.string().cuid().optional(),
  slotId: z.string().cuid().optional(),
  lecturerId: z.string().cuid().optional(),
});

export type GenerateInput = z.infer<typeof GenerateSchema>;
export type ManualAssignInput = z.infer<typeof ManualAssignSchema>;
export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>;
