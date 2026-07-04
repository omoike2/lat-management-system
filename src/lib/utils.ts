import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DAY_LABELS, type DayLabel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${m.toString().padStart(2, "0")}${period}`;
}

export function dayLabel(dayOfWeek: number): DayLabel {
  return DAY_LABELS[dayOfWeek] ?? "Monday";
}
