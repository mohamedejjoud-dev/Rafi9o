/**
 * Rafi9i — FoxPath: Guided Milestone Track with 3D Rafi
 * -----------------------------------------------------
 * Clean educational progression track where 3D Rafi rides above milestones.
 * Positions use inline-start so the track runs right-to-left in RTL locales.
 */
"use client";

import { Check } from "lucide-react";
import RafiFox from "./RafiFox";
import FoxMessage from "./FoxMessage";
import type { FoxMood } from "./FoxGuide";
import { useI18n } from "@/lib/i18n";

export interface FoxPathProps {
  /** 0–100 — clamped internally. */
  progress: number;
  /** Message displayed next to Rafi. */
  message?: string;
  mood?: FoxMood;
  className?: string;
}

const MILESTONES = [
  { pct: 0, key: "pub.foxPath.signup" },
  { pct: 20, key: "pub.foxPath.academic" },
  { pct: 40, key: "pub.foxPath.interests" },
  { pct: 60, key: "pub.foxPath.preferences" },
  { pct: 80, key: "pub.foxPath.softSkills" },
  { pct: 100, key: "pub.foxPath.result" },
] as const;

/** Centers an absolutely positioned element on its inline-start offset, in LTR and RTL. */
const CENTER_ON_START = "-translate-x-1/2 rtl:translate-x-1/2";

export default function FoxPath({ progress, message, mood, className = "" }: FoxPathProps) {
  const { t } = useI18n();
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  const reached = (pct: number) => safe >= pct;
  const finished = safe >= 100;
  const resolvedMood: FoxMood = mood ?? (finished ? "celebrating" : "encouraging");
  const activeKey = [...MILESTONES].reverse().find((m) => safe >= m.pct)?.key ?? MILESTONES[0].key;
  const activeLabel = t(activeKey);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mx-4 sm:mx-8">
        {/* 3D Rafi gliding above the track */}
        <div
          className={`rf-slide absolute bottom-8 z-10 flex flex-col items-center ${CENTER_ON_START}`}
          style={{ insetInlineStart: `${safe}%` }}
        >
          {message && !finished && (
            <FoxMessage message={message} compact className="mb-2 hidden max-w-[15rem] sm:block" />
          )}
          <div className="rf-float">
            <RafiFox mood={resolvedMood} stage={finished ? "achievement" : "assessment"} size={72} decorative />
          </div>
        </div>

        {/* Educational Milestone Track */}
        <div className="mt-28">
          <div className="relative h-2.5 rounded-full border border-border bg-muted shadow-inner">
            {/* Orange-amber progress line */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-sm shadow-orange-500/30 transition-all duration-700 ease-out rtl:bg-gradient-to-l"
              style={{ width: `${safe}%` }}
              role="progressbar"
              aria-valuenow={safe}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("pub.foxPath.aria", { step: activeLabel })}
            />

            {/* Milestones */}
            {MILESTONES.map((m) => {
              const isReached = reached(m.pct);
              const isActive = activeKey === m.key && !isReached;
              const labelPosition =
                m.pct === 0 ? "start-0" : m.pct === 100 ? "end-0" : `start-1/2 ${CENTER_ON_START}`;
              return (
                <div
                  key={m.key}
                  className={`absolute top-1/2 -translate-y-1/2 ${CENTER_ON_START}`}
                  style={{ insetInlineStart: `${m.pct}%` }}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isReached
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                        : isActive
                          ? "border-orange-500 bg-card text-orange-600 shadow-md ring-4 ring-orange-100 dark:text-orange-400 dark:ring-orange-900/50"
                          : "border-slate-300 bg-card text-muted-foreground dark:border-slate-600"
                    }`}
                  >
                    {isReached ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    ) : isActive ? (
                      <span className="h-2 w-2 animate-ping rounded-full bg-orange-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </span>
                  <span
                    aria-current={isActive ? "step" : undefined}
                    className={`absolute top-8 whitespace-nowrap text-[11px] font-semibold tracking-wide ${labelPosition} ${
                      isActive
                        ? "font-bold text-orange-700 dark:text-orange-400"
                        : isReached
                          ? "font-semibold text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {t(m.key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile label */}
          <p className="mt-10 text-center text-xs font-semibold text-orange-700 dark:text-orange-400 sm:hidden">
            {t("pub.foxPath.current")} <span className="font-bold text-foreground">{activeLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
