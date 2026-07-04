"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SlideOver({ open, onClose, title, children, footer }: SlideOverProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[420px] bg-white shadow-xl border-l border-[--color-border] z-50",
          "flex flex-col",
          "translate-x-0 transition-transform duration-200 ease-out"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="h-14 px-6 flex items-center justify-between border-b border-[--color-border] shrink-0">
          <h2 className="text-[15px] font-medium text-[--color-text-primary]">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center text-[--color-text-muted] hover:bg-[--color-bg] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[--color-border] flex gap-3 justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
