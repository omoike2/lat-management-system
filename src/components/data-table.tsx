"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  action?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  searchKeys = [],
  action,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortKey] ?? "");
      const bv = String((b as Record<string, unknown>)[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(v: string) {
    setQuery(v);
    setPage(1);
  }

  return (
    <div className="bg-white rounded-lg border border-[--color-border] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-border]">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted]" />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-[--color-border] focus:border-[--color-brand] focus:ring-1 focus:ring-[--color-brand] outline-none"
          />
        </div>
        {action}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[--color-bg] border-b border-[--color-border]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={col.sortable ? () => toggleSort(String(col.key)) : undefined}
                  className={cn(
                    "h-10 px-4 text-left text-[13px] font-medium text-[--color-text-secondary] uppercase tracking-wide",
                    col.sortable && "cursor-pointer select-none hover:text-[--color-text-primary]"
                  )}
                >
                  {col.header}
                  {col.sortable && sortKey === String(col.key) && (
                    <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-[--color-text-muted]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[--color-border] h-12 text-sm hover:bg-[--color-brand-subtle] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4">
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[--color-border]">
        <span className="text-xs text-[--color-text-secondary]">
          {sorted.length === 0
            ? "No results"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 w-7 rounded flex items-center justify-center text-[--color-text-secondary] hover:bg-[--color-bg] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-[--color-text-secondary] px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-7 w-7 rounded flex items-center justify-center text-[--color-text-secondary] hover:bg-[--color-bg] disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
