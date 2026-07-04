import { z } from "zod";

export const CreateCourseSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  title: z.string().min(1, "Title is required").max(200),
  department: z.string().min(1, "Department is required"),
  level: z.coerce.number().int().refine((v) => [100, 200, 300, 400, 500].includes(v), {
    message: "Level must be 100, 200, 300, 400, or 500",
  }),
  units: z.coerce.number().int().min(1).max(6),
  weeklyFreq: z.coerce.number().int().min(1).max(5).default(2),
});

export const UpdateCourseSchema = CreateCourseSchema.extend({
  id: z.string().cuid(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
