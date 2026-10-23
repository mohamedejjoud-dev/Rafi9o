/**
 * Rafi9i — Strengths display (Developer 2)
 */
"use client";

import { Sparkles } from "lucide-react";

export default function StrengthsBadges({ strengths }: { strengths: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {strengths.map((s) => (
        <li
          key={s}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {s}
        </li>
      ))}
    </ul>
  );
}
