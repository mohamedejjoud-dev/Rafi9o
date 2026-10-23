/**
 * Rafi9i — StatusBadge (Educational Edition)
 * Clean status badges for demo, free, premium, and soon status.
 */
"use client";

import { useI18n } from "@/lib/i18n";

export type StatusVariant = "demo" | "free" | "premium" | "soon" | "neutral";

const STYLES: Record<StatusVariant, string> = {
  demo: "border-orange-200 bg-orange-50 text-orange-800 shadow-2xs dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300",
  free: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  premium: "border-blue-200 bg-blue-50 text-blue-800 shadow-2xs dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  soon: "border-border bg-muted text-muted-foreground",
  neutral: "border-border bg-card text-foreground",
};

export default function StatusBadge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: StatusVariant;
  children?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const defaultLabels: Record<StatusVariant, string> = {
    demo: t("status.demo"),
    free: t("status.free"),
    premium: t("status.premium"),
    soon: t("status.soon"),
    neutral: "",
  };
  const label = children ?? defaultLabels[variant];
  if (!label) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${STYLES[variant]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
