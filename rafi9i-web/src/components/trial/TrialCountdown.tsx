/**
 * Rafi9i — Live trial countdown (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";

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
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(expiresAt));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!remaining) {
    return (
      <p className="text-sm font-semibold text-red-600" role="timer">
        Cet aperçu est arrivé à expiration.
      </p>
    );
  }

  const boxes = [
    { value: remaining.d, label: "jours" },
    { value: remaining.h, label: "heures" },
    { value: remaining.m, label: "min" },
    { value: remaining.s, label: "sec" },
  ];

  return (
    <div role="timer" aria-label="Temps restant avant la fin de l'aperçu Premium">
      <div className="flex gap-2">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="flex min-w-[64px] flex-col items-center rounded-xl border border-orange-200 bg-white px-3 py-2 shadow-sm"
          >
            <span className="text-xl font-bold tabular-nums text-stone-900" aria-label={`${b.value} ${b.label}`}>
              {pad(b.value)}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-stone-500">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
