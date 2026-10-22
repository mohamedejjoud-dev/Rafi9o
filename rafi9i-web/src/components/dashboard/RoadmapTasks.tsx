/**
 * Rafi9i — Roadmap tasks grouped by stage (Developer 2)
 * Shared by the Premium result and the dashboard roadmap page.
 */
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  ROADMAP_STAGE_DESCRIPTIONS,
  ROADMAP_STAGE_LABELS,
  type RoadmapStage,
  type RoadmapStep,
} from "@/lib/types";

const STAGE_EMOJIS: Record<RoadmapStage, string> = {
  explore: "🔍",
  learn: "📚",
  practice: "🛠️",
  prepare: "🎯",
};

const STAGE_ORDER: RoadmapStage[] = ["explore", "learn", "practice", "prepare"];

export interface RoadmapTasksProps {
  steps: RoadmapStep[];
  onToggle: (id: string, completed: boolean) => void;
}

export default function RoadmapTasks({ steps, onToggle }: RoadmapTasksProps) {
  return (
    <div className="space-y-5">
      {STAGE_ORDER.map((stage, stageIndex) => {
        const items = steps.filter((s) => s.stage === stage);
        if (items.length === 0) return null;
        const done = items.filter((s) => s.completed).length;
        return (
          <section key={stage} className="relative" aria-labelledby={`stage-${stage}`}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 id={`stage-${stage}`} className="text-sm font-bold text-stone-900">
                <span className="mr-1.5" aria-hidden>
                  {STAGE_EMOJIS[stage]}
                </span>
                Étape {stageIndex + 1} · {ROADMAP_STAGE_LABELS[stage]}
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                {done}/{items.length}
              </span>
            </div>
            <p className="mb-2.5 text-xs text-stone-500">{ROADMAP_STAGE_DESCRIPTIONS[stage]}</p>
            <ol className="space-y-2.5">
              {items.map((step) => (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                    step.completed ? "border-emerald-200 bg-emerald-50/50" : "border-stone-200 bg-white"
                  }`}
                >
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={(v) => onToggle(step.id, v === true)}
                    className="mt-0.5"
                    aria-label={`Marquer « ${step.title} » comme ${step.completed ? "à faire" : "terminé"}`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${step.completed ? "text-emerald-800 line-through" : "text-stone-900"}`}>
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{step.description}</p>
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
