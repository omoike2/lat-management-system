import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "./sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar email={session.user?.email ?? ""} />
      <main className="flex-1 ml-64 overflow-y-auto bg-[--color-bg]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
