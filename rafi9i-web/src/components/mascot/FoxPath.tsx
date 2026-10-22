/**
 * Rafi9i — FoxPath: Guided Milestone Track with 3D Rafi
 * -----------------------------------------------------
 * Clean educational progression track where 3D Rafi rides above milestones.
 */
"use client";

import { Check } from "lucide-react";
import RafiFox from "./RafiFox";
import FoxMessage from "./FoxMessage";
import type { FoxMood } from "./FoxGuide";

export interface FoxPathProps {
  /** 0–100 — clamped internally. */
  progress: number;
  /** Message displayed next to Rafi. */
  message?: string;
  mood?: FoxMood;
  className?: string;
}

const MILESTONES = [
  { pct: 0, label: "Inscription" },
  { pct: 20, label: "Profil académique" },
  { pct: 40, label: "Intérêts" },
  { pct: 60, label: "Préférences" },
  { pct: 80, label: "Soft skills" },
  { pct: 100, label: "Résultat" },
] as const;

export default function FoxPath({ progress, message, mood, className = "" }: FoxPathProps) {
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  const reached = (pct: number) => safe >= pct;
  const finished = safe >= 100;
  const resolvedMood: FoxMood = mood ?? (finished ? "celebrating" : "encouraging");
  const activeLabel = [...MILESTONES].reverse().find((m) => safe >= m.pct)?.label ?? MILESTONES[0].label;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mx-4 sm:mx-8">
        {/* 3D Rafi gliding above the track */}
        <div
          className="rf-slide absolute bottom-8 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${safe}%` }}
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
          <div className="relative h-2.5 rounded-full bg-slate-200 border border-slate-300/80 shadow-inner">
            {/* Orange-amber progress line */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 transition-all duration-700 ease-out shadow-sm shadow-orange-500/30"
              style={{ width: `${safe}%` }}
              role="progressbar"
              aria-valuenow={safe}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression du parcours : ${activeLabel}`}
            />

            {/* Milestones */}
            {MILESTONES.map((m) => {
              const isReached = reached(m.pct);
              const isActive = activeLabel === m.label && !isReached;
              return (
                <div
                  key={m.label}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${m.pct}%` }}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isReached
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                        : isActive
                          ? "border-orange-500 bg-white text-orange-600 shadow-md ring-4 ring-orange-100"
                          : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isReached ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    ) : isActive ? (
                      <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    )}
                  </span>
                  <span
                    aria-current={isActive ? "step" : undefined}
                    className={`absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-wide ${
                      isActive
                        ? "text-orange-700 font-bold"
                        : isReached
                          ? "text-emerald-700 font-semibold"
                          : "text-slate-500"
                    } ${m.pct === 0 ? "-translate-x-0.5" : ""} ${m.pct === 100 ? "-translate-x-full" : ""}`}
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile label */}
          <p className="mt-10 text-center text-xs font-semibold text-orange-700 sm:hidden">
            Étape actuelle : <span className="font-bold text-slate-900">{activeLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
