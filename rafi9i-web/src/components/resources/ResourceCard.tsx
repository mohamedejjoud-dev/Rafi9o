/**
 * Rafi9i — Learning resource card with completion tracking (Developer 2)
 */
"use client";

import { BookOpen, Bookmark, BookmarkCheck, BookMarked, Mic } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RESOURCE_TYPE_LABELS } from "@/lib/types";
import type { LearningResource } from "@/lib/types";

const TYPE_ICONS = {
  course: BookOpen,
  podcast: Mic,
  ebook: BookMarked,
} as const;

export interface ResourceCardProps {
  resource: LearningResource;
  saved?: boolean;
  onToggleCompleted: (completed: boolean) => void;
  onToggleSaved?: () => void;
}

export default function ResourceCard({ resource, saved, onToggleCompleted, onToggleSaved }: ResourceCardProps) {
  const Icon = TYPE_ICONS[resource.type];
  return (
    <article
      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
        resource.completed ? "border-emerald-200 bg-emerald-50/50" : "border-stone-200 bg-white"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
        <Icon className="h-4.5 w-4.5 text-orange-600" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600">
            {RESOURCE_TYPE_LABELS[resource.type]}
          </span>
          <span className="text-[11px] text-stone-400">{resource.duration}</span>
        </div>
        <h3 className={`mt-1 text-sm font-semibold ${resource.completed ? "text-emerald-800" : "text-stone-900"}`}>
          {resource.title}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{resource.description}</p>
        <label className="mt-2.5 flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-stone-700">
          <Checkbox
            checked={resource.completed}
            onCheckedChange={(v) => onToggleCompleted(v === true)}
            aria-label={`Marquer « ${resource.title} » comme ${resource.completed ? "non terminé" : "terminé"}`}
          />
          {resource.completed ? "Terminé ✓" : "Marquer comme terminé"}
        </label>
      </div>
      {onToggleSaved && (
        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={saved ? `Retirer « ${resource.title} » des favoris` : `Enregistrer « ${resource.title} » dans les favoris`}
          className="rounded-full border border-stone-200 bg-white p-1.5 text-stone-400 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-orange-600" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        </button>
      )}
    </article>
  );
}
