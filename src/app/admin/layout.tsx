import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "./shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <AdminShell email={session.user?.email ?? ""}>
      {children}
    </AdminShell>
  );
}
