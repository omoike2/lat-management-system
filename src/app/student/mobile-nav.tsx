"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/study", label: "Study Plan", icon: BookOpenCheck },
] as const;

export function StudentMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-gray-200 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-(--color-brand)"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
