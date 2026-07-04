"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/lecturers", label: "Lecturers", icon: Users },
  { href: "/admin/venues", label: "Venues", icon: Building2 },
  { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
] as const;

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[--color-border] h-screen fixed top-0 left-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[--color-border]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[--color-brand] flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <span className="font-semibold text-[--color-text-primary]">LAT System</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[--color-brand-light] text-[--color-brand] font-medium"
                  : "text-[--color-text-secondary] hover:bg-[--color-brand-subtle] hover:text-[--color-text-primary]"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[--color-border]">
        <div className="px-4 py-2 text-xs text-[--color-text-muted] truncate mb-1">{email}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[--color-text-secondary] hover:bg-[--color-brand-subtle] hover:text-[--color-text-primary] transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
