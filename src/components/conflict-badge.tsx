import { AlertTriangle } from "lucide-react";

interface ConflictBadgeProps {
  count: number;
}

export function ConflictBadge({ count }: ConflictBadgeProps) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      <AlertTriangle className="w-3 h-3" />
      {count} conflict{count !== 1 ? "s" : ""}
    </span>
  );
}
