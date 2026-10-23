/**
 * Rafi9i — Rafi's 3D Speech Bubble
 * Friendly, clear dialogue balloon where Rafi speaks directly with the student.
 */
"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export interface FoxMessageProps {
  message: string;
  /** Optional 0–100 progress shown as a small bar under the text. */
  progress?: number;
  compact?: boolean;
  className?: string;
}

export default function FoxMessage({ message, progress, compact = false, className = "" }: FoxMessageProps) {
  const { t } = useI18n();
  const safe = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div
      className={`relative rounded-2xl rounded-es-sm border border-border bg-card px-4 py-3 shadow-md ${
        compact ? "max-w-xs" : "max-w-md"
      } ${className}`}
    >
      {/* Speech balloon pointer */}
      <div className="absolute -start-2 bottom-3.5 h-3 w-3 -rotate-45 border-b border-s border-border bg-card rtl:rotate-45" />

      {/* Header with Rafi's identity */}
      <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-border pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-foreground flex items-center gap-1">
            <Image src="/images/rafi9i-mark.png" alt="" width={16} height={16} aria-hidden />
            {t("pub.mascot.name")}
          </span>
          <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-900/50">
            {t("pub.mascot.role")}
          </span>
        </div>
      </div>

      <p className={`leading-relaxed text-foreground font-medium ${compact ? "text-xs" : "text-sm"}`}>{message}</p>

      {safe !== undefined && (
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={safe}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${safe}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{safe}%</span>
        </div>
      )}
    </div>
  );
}
