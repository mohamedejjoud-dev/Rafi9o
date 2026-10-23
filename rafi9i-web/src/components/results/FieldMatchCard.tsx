/**
 * Rafi9i — Academic field match card (Developer 2)
 * Used on free result, premium result and dashboard orientation.
 */
"use client";

import { Bookmark, BookmarkCheck, MapPin, TriangleAlert, Trophy } from "lucide-react";
import { ScoreRing } from "@/components/shared/ScoreBar";
import type { FieldMatch } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const FIELD_EMOJIS: Record<string, string> = {
  "informatique-data": "💻",
  ingenierie: "🏗️",
  "medecine-sante": "⚕️",
  "commerce-gestion": "🛍️",
  "droit-sciences-po": "⚖️",
};

export interface FieldMatchCardProps {
  field: FieldMatch;
  primary?: boolean;
  detailed?: boolean;
  saved?: boolean;
  onToggleSave?: () => void;
}

export default function FieldMatchCard({
  field,
  primary = false,
  detailed = false,
  saved = false,
  onToggleSave,
}: FieldMatchCardProps) {
  const { t } = useI18n();
  return (
    <article
      className={
        primary
          ? "rafi-card-hover rounded-2xl border border-orange-300 bg-card p-5 shadow-md ring-1 ring-orange-200 dark:border-orange-800 dark:ring-orange-900/60 sm:p-6"
          : "rafi-card-hover rounded-2xl border border-border bg-card p-5 shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-2xl" aria-hidden>{FIELD_EMOJIS[field.id] ?? "🎓"}</span>
          <div className="min-w-0">
            {primary && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <Trophy className="h-3 w-3" aria-hidden />
                {t("asm.field.primary")}
              </span>
            )}
            <h3 className="text-base font-bold leading-tight text-foreground sm:text-lg">{field.name}</h3>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ScoreRing value={field.score} size={56} />
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={t(saved ? "asm.field.unsave" : "asm.field.save", { name: field.name })}
              className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-700 dark:hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {saved ? <BookmarkCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${detailed ? "" : "line-clamp-3"}`}>
        {field.explanation}
      </p>

      {detailed && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{t("asm.field.strengths")}</h4>
            <ul className="mt-1.5 space-y-1">
              {field.strengths.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">{t("asm.field.challenges")}</h4>
            <ul className="mt-1.5 space-y-1">
              {field.potentialChallenges.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(detailed || primary) && field.nextAction && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/40">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
          <p className="text-xs leading-relaxed text-foreground">
            <span className="font-semibold text-foreground">{t("asm.field.nextAction")}</span>{" "}
            {field.nextAction}
          </p>
        </div>
      )}

      {!detailed && !primary && field.potentialChallenges.length > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {field.potentialChallenges[0]}
        </p>
      )}
    </article>
  );
}
