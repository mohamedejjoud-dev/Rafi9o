/**
 * Rafi9i — Grouped learning resources list (Developer 2)
 */
"use client";

import ResourceCard from "@/components/resources/ResourceCard";
import type { LearningResource } from "@/lib/types";

export interface ResourceListProps {
  resources: LearningResource[];
  savedIds: string[];
  onToggleCompleted: (id: string, completed: boolean) => void;
  onToggleSaved: (id: string) => void;
}

const GROUPS: { type: LearningResource["type"]; label: string; emoji: string; description: string }[] = [
  { type: "course", label: "Cours en ligne", emoji: "📚", description: "Pour construire des bases solides à ton rythme." },
  { type: "podcast", label: "Podcasts", emoji: "🎧", description: "À écouter dans les transports ou en marchant." },
  { type: "ebook", label: "E-books & guides", emoji: "📖", description: "Pour approfondir et garder des repères écrits." },
];

export default function ResourceList({ resources, savedIds, onToggleCompleted, onToggleSaved }: ResourceListProps) {
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
                <h3 id={`res-${group.type}`} className="text-sm font-bold text-stone-900">
                  {group.emoji} {group.label}
                </h3>
                <p className="text-xs text-stone-500">{group.description}</p>
              </div>
              <span className="text-xs font-semibold text-stone-500">
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
