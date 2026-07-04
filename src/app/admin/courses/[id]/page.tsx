import { notFound } from "next/navigation";
import { getCourse } from "@/features/courses/queries";
import { listLecturers } from "@/features/lecturers/queries";
import CourseEditClient from "./course-edit-client";

export default async function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, lecturers] = await Promise.all([getCourse(id), listLecturers()]);
  if (!course) notFound();
  return <CourseEditClient course={course} allLecturers={lecturers} />;
}
