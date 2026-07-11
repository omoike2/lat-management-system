"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  CalendarDays,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/lecturers", label: "Lecturers", icon: Users },
  { href: "/admin/venues", label: "Venues", icon: Building2 },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
] as const;

interface AdminSidebarProps {
  email: string;
  onNavClick?: () => void;
}

export default function AdminSidebar({ email, onNavClick }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-(--color-border) h-screen flex flex-col">
      <div className="h-16 flex items-center px-5 bg-(--color-brand)">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image src="/lasu-logo.png" alt="LASU" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">LAT System</p>
            <p className="text-white/60 text-[10px] leading-tight uppercase tracking-wide">Timetable</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors relative",
                active
                  ? "bg-(--color-brand-light) text-(--color-brand) font-semibold"
                  : "text-(--color-text-secondary) hover:bg-(--color-brand-subtle) hover:text-(--color-text-primary)"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--color-brand) rounded-r-full" />
              )}
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-(--color-border)">
        <div className="px-4 py-2 text-xs text-(--color-text-muted) truncate mb-1">{email}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-(--color-text-secondary) hover:bg-(--color-brand-subtle) hover:text-(--color-text-primary) transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
