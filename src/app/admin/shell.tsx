"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./sidebar";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ email, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <AdminSidebar email={email} onNavClick={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-y-auto bg-(--color-bg)">
        {/* Mobile header with hamburger */}
        <div className="flex items-center gap-3 h-14 px-4 bg-(--color-brand) md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white/15 border border-white/25 flex items-center justify-center">
              <span className="text-white text-xs font-bold leading-none">L</span>
            </div>
            <span className="font-semibold text-sm text-white">LAT System</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Close button when sidebar open on mobile (inside sidebar area, top-right) */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-3 left-[13.5rem] z-40 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-(--color-border) text-(--color-text-secondary) md:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
