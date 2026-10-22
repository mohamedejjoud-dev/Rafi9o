/**
 * Rafi9i — Weekly soft-skills challenge card (Developer 2)
 */
"use client";

import { Flame, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SoftSkillPriority } from "@/lib/types";

export interface WeeklyChallengeCardProps {
  challenge: SoftSkillPriority;
  completed: boolean;
  onToggle: (done: boolean) => void;
}

export default function WeeklyChallengeCard({ challenge, completed, onToggle }: WeeklyChallengeCardProps) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm transition-colors ${
        completed ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-white" : "border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50"
      }`}
      aria-labelledby="weekly-challenge"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="weekly-challenge" className="flex items-center gap-2 text-base font-bold text-stone-900">
          <Flame className={`h-5 w-5 ${completed ? "text-emerald-600" : "text-orange-600"}`} aria-hidden />
          Défi soft skills de la semaine
        </h2>
        {completed && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Terminé ✓</span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-stone-800">{challenge.name}</p>
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-white/70 p-3">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden />
        <p className="text-xs leading-relaxed text-stone-700">{challenge.action}</p>
      </div>
      <Button
        variant={completed ? "outline" : "default"}
        size="sm"
        onClick={() => onToggle(!completed)}
        className={`mt-3 ${completed ? "" : ""}`}
        aria-pressed={completed}
      >
        {completed ? "Reprendre le défi" : "Marquer comme terminé"}
      </Button>
    </section>
  );
}
