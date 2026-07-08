import { z } from "zod";

export const RegisterStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  matric: z.string().min(3, "Invalid matric number"),
  department: z.string().min(1, "Department is required"),
  level: z.coerce.number().int().min(100).max(500),
});

export type RegisterStudentInput = z.infer<typeof RegisterStudentSchema>;

export const CourseRegistrationSchema = z.object({
  courseId: z.string().cuid("Invalid course ID"),
});

export type CourseRegistrationInput = z.infer<typeof CourseRegistrationSchema>;
