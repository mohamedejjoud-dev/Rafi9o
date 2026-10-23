/**
 * Rafi9i — Demo mode badge (Developer 2)
 * Shows whenever the API client is serving mock data.
 */
"use client";

import { useEffect, useState } from "react";
import { getApiMode, onApiModeChange, type ApiMode } from "@/lib/api";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function DemoBadge({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ApiMode>("demo");

  useEffect(() => {
    setMode(getApiMode());
    return onApiModeChange(setMode);
  }, []);

  if (mode === "live") return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 ${className}`}
      role="note"
      aria-label={t("pub.demoBadge.aria")}
    >
      <Image src="/images/rafi9i-mark.png" alt="" width={14} height={14} aria-hidden />
      {t("pub.demoBadge.label")}
    </div>
  );
}
