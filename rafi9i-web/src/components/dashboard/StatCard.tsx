/**
 * Rafi9i — Dashboard stat card (Developer 2)
 */
"use client";

import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        accent
          ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900/60 dark:from-orange-950/50 dark:to-amber-950/30"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2.5 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
