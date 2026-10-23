/**
 * Rafi9i — Soft skill priority card (Developer 2)
 */
"use client";

import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/shared/ScoreBar";
import type { SoftSkillPriority } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export interface SoftSkillCardProps {
  skill: SoftSkillPriority;
  completed?: boolean;
  onToggleComplete?: () => void;
}

export default function SoftSkillCard({ skill, completed = false, onToggleComplete }: SoftSkillCardProps) {
  const { t } = useI18n();
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">{skill.name}</h3>
        <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
          {t("asm.level", { n: skill.currentLevel })}
        </span>
      </div>
      <ScoreBar value={skill.currentLevel} className="mt-2.5" />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{t("asm.skill.why")}</span>{" "}
        {skill.reason}
      </p>
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/40">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
        <p className="text-xs leading-relaxed text-foreground">
          <span className="font-semibold">{t("asm.skill.action")}</span>{" "}
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
          {completed ? t("asm.skill.done") : t("asm.skill.markDone")}
        </Button>
      )}
    </article>
  );
}
