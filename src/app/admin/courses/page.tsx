import { listCourses } from "@/features/courses/queries";
import CoursesClient from "./courses-client";

export default async function CoursesPage() {
  const courses = await listCourses();
  return <CoursesClient courses={courses} />;
}
