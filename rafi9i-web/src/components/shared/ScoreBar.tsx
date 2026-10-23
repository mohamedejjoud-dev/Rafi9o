/**
 * Rafi9i — Score visuals: horizontal bar + radial ring (Developer 2)
 */
"use client";

import { useI18n } from "@/lib/i18n";

export function ScoreBar({
  value,
  label,
  highlight = false,
  className = "",
}: {
  value: number;
  label?: string;
  highlight?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span className={highlight ? "text-orange-700 dark:text-orange-400" : ""}>{safe}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? t("asm.score.aria")}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            highlight ? "bg-gradient-to-r from-amber-400 to-orange-600" : "bg-orange-400"
          }`}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - safe / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c1a465" />
            <stop offset="100%" stopColor="#f88541" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{safe}%</span>
    </div>
  );
}
