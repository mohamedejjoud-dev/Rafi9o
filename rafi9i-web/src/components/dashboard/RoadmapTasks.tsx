/**
 * Rafi9i — Roadmap tasks grouped by stage (Developer 2)
 * Shared by the Premium result and the dashboard roadmap page.
 */
"use client";

import { BookOpen, Search, Target, Wrench, type LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import type { RoadmapStage, RoadmapStep } from "@/lib/types";

const STAGE_ICONS: Record<RoadmapStage, LucideIcon> = {
  explore: Search,
  learn: BookOpen,
  practice: Wrench,
  prepare: Target,
};

const STAGE_ORDER: RoadmapStage[] = ["explore", "learn", "practice", "prepare"];

export interface RoadmapTasksProps {
  steps: RoadmapStep[];
  onToggle: (id: string, completed: boolean) => void;
}

export default function RoadmapTasks({ steps, onToggle }: RoadmapTasksProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      {STAGE_ORDER.map((stage, stageIndex) => {
        const items = steps.filter((s) => s.stage === stage);
        if (items.length === 0) return null;
        const done = items.filter((s) => s.completed).length;
        const StageIcon = STAGE_ICONS[stage];
        return (
          <section key={stage} className="relative" aria-labelledby={`stage-${stage}`}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 id={`stage-${stage}`} className="flex items-center text-sm font-bold text-foreground">
                <StageIcon className="me-1.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
                {t("dsh.stage.label", { n: stageIndex + 1, name: t(`dsh.stage.${stage}`) })}
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                {done}/{items.length}
              </span>
            </div>
            <p className="mb-2.5 text-xs text-muted-foreground">{t(`dsh.stage.${stage}.desc`)}</p>
            <ol className="space-y-2.5">
              {items.map((step) => (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                    step.completed
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                      : "border-border bg-card"
                  }`}
                >
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={(v) => onToggle(step.id, v === true)}
                    className="mt-0.5"
                    aria-label={t(step.completed ? "dsh.task.markTodo" : "dsh.task.markDone", { title: step.title })}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        step.completed ? "text-emerald-800 line-through dark:text-emerald-300" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
