/**
 * Rafi9i — One focused question per screen (Developer 2)
 * Mobile-friendly answer cards, keyboard accessible.
 */
"use client";

import { Check } from "lucide-react";
import type { AssessmentQuestion } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export interface QuestionCardProps {
  question: AssessmentQuestion;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

function optionClasses(selected: boolean): string {
  return [
    "group flex w-full items-start gap-3 rounded-xl border p-4 text-start transition-all",
    "min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
    selected
      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 dark:border-orange-500 ring-1 ring-orange-500"
      : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-stone-800/80",
  ].join(" ");
}

export default function QuestionCard({ question, value, error, onChange }: QuestionCardProps) {
  const { locale, dir } = useI18n();
  const { type } = question;

  /* ---------------- Scale (1–5) ---------------- */
  if (type === "scale" && question.scale) {
    const { min, max, minLabel, maxLabel } = question.scale;
    const current = typeof value === "number" ? value : undefined;
    const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <div dir={dir}>
        <div
          role="radiogroup"
          aria-labelledby={`q-${question.id}`}
          className="flex flex-wrap items-stretch justify-between gap-2 sm:gap-3"
        >
          {scaleValues.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={current === n}
              onClick={() => onChange(n)}
              className={[
                "flex h-14 min-w-[52px] flex-1 items-center justify-center rounded-xl border text-lg font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                current === n
                  ? "border-orange-500 bg-orange-600 text-white shadow-sm"
                  : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      </div>
    );
  }

  /* ---------------- Single choice ---------------- */
  if (type === "single") {
    return (
      <div dir={dir}>
        <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="grid gap-2.5 sm:grid-cols-2">
          {question.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(opt.value)}
                className={optionClasses(selected)}
              >
                {opt.emoji && <span className="text-xl shrink-0" aria-hidden>{opt.emoji}</span>}
                <span className="text-sm font-medium leading-snug text-stone-800 dark:text-stone-100">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      </div>
    );
  }

  /* ---------------- Multi choice ---------------- */
  const selectedList = Array.isArray(value) ? (value as string[]) : [];
  const atMax = question.maxSelections !== undefined && selectedList.length >= question.maxSelections;

  const countLabel =
    locale === "ar"
      ? `${selectedList.length} محدد${question.maxSelections ? ` / ${question.maxSelections}` : ""}`
      : locale === "en"
        ? `${selectedList.length}${question.maxSelections ? ` / ${question.maxSelections}` : ""} selected`
        : question.maxSelections
          ? `${selectedList.length} / ${question.maxSelections} sélectionné${selectedList.length > 1 ? "s" : ""}`
          : `${selectedList.length} sélectionné${selectedList.length > 1 ? "s" : ""}`;

  const maxLabel =
    locale === "ar"
      ? "تم الوصول إلى الحد الأقصى — قم بإلغاء التحديد للتغيير."
      : locale === "en"
        ? "Maximum reached — uncheck to change."
        : "Maximum atteint — désélectionne pour changer.";

  return (
    <div dir={dir}>
      <div
        role="group"
        aria-labelledby={`q-${question.id}`}
        className="grid gap-2.5 sm:grid-cols-2"
      >
        {question.options?.map((opt) => {
          const selected = selectedList.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => {
                if (selected) {
                  onChange(selectedList.filter((v) => v !== opt.value));
                } else if (!atMax) {
                  onChange([...selectedList, opt.value]);
                }
              }}
              className={optionClasses(selected)}
            >
              <span
                aria-hidden
                className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  selected
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900",
                ].join(" ")}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              {opt.emoji && <span className="text-xl shrink-0" aria-hidden>{opt.emoji}</span>}
              <span className="text-sm font-medium leading-snug text-stone-800 dark:text-stone-100">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-stone-500 dark:text-stone-400">{countLabel}</p>
        {atMax && <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{maxLabel}</p>}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
