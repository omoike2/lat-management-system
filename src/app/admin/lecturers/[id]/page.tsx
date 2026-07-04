import { notFound } from "next/navigation";
import { getLecturer } from "@/features/lecturers/queries";
import LecturerEditClient from "./lecturer-edit-client";

export default async function LecturerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lecturer = await getLecturer(id);
  if (!lecturer) notFound();
  return <LecturerEditClient lecturer={lecturer} />;
}
