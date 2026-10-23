/**
 * Rafi9i — Grouped learning resources list (Developer 2)
 */
"use client";

import { BookMarked, BookOpen, Headphones, type LucideIcon } from "lucide-react";
import ResourceCard from "@/components/resources/ResourceCard";
import { useI18n } from "@/lib/i18n";
import type { LearningResource } from "@/lib/types";

export interface ResourceListProps {
  resources: LearningResource[];
  savedIds: string[];
  onToggleCompleted: (id: string, completed: boolean) => void;
  onToggleSaved: (id: string) => void;
}

const GROUPS: { type: LearningResource["type"]; icon: LucideIcon }[] = [
  { type: "course", icon: BookOpen },
  { type: "podcast", icon: Headphones },
  { type: "ebook", icon: BookMarked },
];

export default function ResourceList({ resources, savedIds, onToggleCompleted, onToggleSaved }: ResourceListProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const items = resources.filter((r) => r.type === group.type);
        if (items.length === 0) return null;
        const done = items.filter((r) => r.completed).length;
        return (
          <section key={group.type} aria-labelledby={`res-${group.type}`}>
            <div className="mb-2.5 flex items-baseline justify-between">
              <div>
                <h3 id={`res-${group.type}`} className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <group.icon className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
                  {t(`dsh.res.group.${group.type}`)}
                </h3>
                <p className="text-xs text-muted-foreground">{t(`dsh.res.group.${group.type}.desc`)}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {done}/{items.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {items.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  saved={savedIds.includes(r.id)}
                  onToggleCompleted={(completed) => onToggleCompleted(r.id, completed)}
                  onToggleSaved={() => onToggleSaved(r.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
