/**
 * Rafi9i — Live trial countdown (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

function getRemaining(expiresAt: string): { d: number; h: number; m: number; s: number } | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function TrialCountdown({ expiresAt }: { expiresAt: string }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(expiresAt));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!remaining) {
    return (
      <p className="text-sm font-semibold text-red-600 dark:text-red-400" role="timer">
        {t("pub.countdown.expired")}
      </p>
    );
  }

  const boxes = [
    { value: remaining.d, label: t("pub.countdown.days") },
    { value: remaining.h, label: t("pub.countdown.hours") },
    { value: remaining.m, label: t("pub.countdown.min") },
    { value: remaining.s, label: t("pub.countdown.sec") },
  ];

  return (
    <div role="timer" aria-label={t("pub.countdown.aria")}>
      <div className="flex gap-2">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="flex min-w-[64px] flex-col items-center rounded-xl border border-orange-200 bg-card px-3 py-2 shadow-sm dark:border-orange-900/50"
          >
            <span className="text-xl font-bold tabular-nums text-foreground" aria-label={`${b.value} ${b.label}`}>
              {pad(b.value)}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
