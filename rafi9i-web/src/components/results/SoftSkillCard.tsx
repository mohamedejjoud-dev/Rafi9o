/**
 * Rafi9i — Soft skill priority card (Developer 2)
 */
"use client";

import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/shared/ScoreBar";
import type { SoftSkillPriority } from "@/lib/types";

export interface SoftSkillCardProps {
  skill: SoftSkillPriority;
  completed?: boolean;
  onToggleComplete?: () => void;
}

export default function SoftSkillCard({ skill, completed = false, onToggleComplete }: SoftSkillCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-stone-900">{skill.name}</h3>
        <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
          Niveau {skill.currentLevel}/100
        </span>
      </div>
      <ScoreBar value={skill.currentLevel} className="mt-2.5" />
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        <span className="font-semibold text-stone-800">Pourquoi c&apos;est important : </span>
        {skill.reason}
      </p>
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden />
        <p className="text-xs leading-relaxed text-stone-700">
          <span className="font-semibold">Action pratique : </span>
          {skill.action}
        </p>
      </div>
      {onToggleComplete && (
        <Button
          variant={completed ? "default" : "outline"}
          size="sm"
          onClick={onToggleComplete}
          className={`mt-3 gap-1.5 ${completed ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
          aria-pressed={completed}
        >
          {completed ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
          {completed ? "Action réalisée ✓" : "Marquer comme faite"}
        </Button>
      )}
    </article>
  );
}
