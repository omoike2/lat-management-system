import { listAllStudents } from "@/features/students/queries";
import StudentsClient from "./students-client";

export const metadata = { title: "Students | LAT Admin" };

export default async function AdminStudentsPage() {
  const students = await listAllStudents();
  return <StudentsClient students={students} />;
}
