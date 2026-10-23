/**
 * Rafi9i — Learning resource card with completion tracking (Developer 2)
 */
"use client";

import { BookOpen, Bookmark, BookmarkCheck, BookMarked, Mic } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
  const Icon = TYPE_ICONS[resource.type];
  return (
    <article
      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
        resource.completed
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
          : "border-border bg-card"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60">
        <Icon className="h-4.5 w-4.5 text-orange-600 dark:text-orange-300" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {t(`dsh.type.${resource.type}`)}
          </span>
          <span className="text-[11px] text-muted-foreground">{resource.duration}</span>
        </div>
        <h3 className={`mt-1 text-sm font-semibold ${resource.completed ? "text-emerald-800 dark:text-emerald-300" : "text-foreground"}`}>
          {resource.title}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{resource.description}</p>
        <label className="mt-2.5 flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <Checkbox
            checked={resource.completed}
            onCheckedChange={(v) => onToggleCompleted(v === true)}
            aria-label={t(resource.completed ? "dsh.res.markUndone" : "dsh.res.markDone", { title: resource.title })}
          />
          {resource.completed ? t("dsh.done") : t("dsh.markDone")}
        </label>
      </div>
      {onToggleSaved && (
        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={t(saved ? "dsh.res.remove" : "dsh.res.save", { title: resource.title })}
          className="rounded-full border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-800 dark:hover:text-orange-400"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        </button>
      )}
    </article>
  );
}
