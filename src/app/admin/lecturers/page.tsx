import { listLecturers } from "@/features/lecturers/queries";
import LecturersClient from "./lecturers-client";

export default async function LecturersPage() {
  const lecturers = await listLecturers();
  return <LecturersClient lecturers={lecturers} />;
}
