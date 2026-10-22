/**
 * Rafi9i — Review screen before final submission (Developer 2)
 */
"use client";

import { CheckCircle2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import { optionLabel, questionLabel } from "@/lib/mocks";
import type { AssessmentQuestion } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export interface ReviewSummaryProps {
  questions: AssessmentQuestion[];
  values: Record<string, unknown>;
  onEdit: (index: number) => void;
  onConfirm: () => void;
  submitting: boolean;
}

export default function ReviewSummary({ questions, values, onEdit, onConfirm, submitting }: ReviewSummaryProps) {
  const { locale, dir } = useI18n();

  const guideMsg =
    locale === "ar"
      ? "ها هي إجاباتك! راجعها للمرة الأخيرة، ثم يقوم رافي بإعداد تحليلك المخصص."
      : locale === "ary"
        ? "ها هما إجاباتك! راجعهم لآخر مرة، ومن بعد رافي غايوجد ليك تحليلك المخصص."
        : locale === "en"
          ? "Here are your answers! Check them one last time, then Rafi will generate your personalized analysis."
          : "Voici tes réponses ! Vérifie-les une dernière fois, puis Rafi prépare ton analyse personnalisée.";

  const headerTitle =
    locale === "ar"
      ? "ملخص إجاباتك"
      : locale === "ary"
        ? "ملخص الإجابات ديالك"
        : locale === "en"
          ? "Summary of your answers"
          : "Récapitulatif de tes réponses";

  const countSubtitle =
    locale === "ar"
      ? `${questions.length} إجابة مسجلة — يمكنك تعديل أي سؤال.`
      : locale === "ary"
        ? `${questions.length} إجابة تسجلات — تقدر تبدل أي سؤال.`
        : locale === "en"
          ? `${questions.length} answers saved — you can edit any question.`
          : `${questions.length} réponses enregistrées — tu peux modifier n'importe quelle question.`;

  const notAnsweredText =
    locale === "ar"
      ? "لم تتم الإجابة بعد"
      : locale === "ary"
        ? "مازال ما جاوبتيش"
        : locale === "en"
          ? "Not answered yet"
          : "Pas encore répondu";

  const editText =
    locale === "ar" ? "تعديل" : locale === "ary" ? "بدل" : locale === "en" ? "Edit" : "Modifier";

  const backText =
    locale === "ar"
      ? "الرجوع إلى الأسئلة"
      : locale === "ary"
        ? "رجع للأسئلة"
        : locale === "en"
          ? "Back to questions"
          : "Revenir aux questions";

  const confirmText =
    submitting
      ? locale === "ar"
        ? "جارٍ التوليد…"
        : locale === "ary"
          ? "كيوجد النتيجة…"
          : locale === "en"
            ? "Generating results…"
            : "Génération en cours…"
      : locale === "ar"
        ? "تأكيد وتوليد النتيجة"
        : locale === "ary"
          ? "أكد وشوف النتيجة ديالي"
          : locale === "en"
            ? "Confirm and generate results"
            : "Confirmer et générer mon résultat";

  return (
    <div className="mx-auto w-full max-w-2xl" dir={dir}>
      <FoxGuide
        stage="assessment"
        mood="celebrating"
        progress={100}
        message={guideMsg}
      />

      <div className="mt-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="border-b border-stone-100 dark:border-stone-800 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-100">
            <CheckCircle2 className="h-5 w-5 text-orange-600" aria-hidden />
            {headerTitle}
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {countSubtitle}
          </p>
        </div>
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {questions.map((q, index) => {
            const v = values[q.id];
            const labels = Array.isArray(v)
              ? (v as string[]).map((x) => optionLabel(questions, q.id, x))
              : typeof v === "number"
                ? [`${v} / 5`]
                : v
                  ? [optionLabel(questions, q.id, String(v))]
                  : [];
            return (
              <li key={q.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-[11px] font-bold text-orange-700 dark:text-orange-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{questionLabel(questions, q.id)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {labels.length === 0 ? (
                      <span className="text-xs italic text-stone-400 dark:text-stone-500">{notAnsweredText}</span>
                    ) : (
                      labels.map((l) => (
                        <span
                          key={l}
                          className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs text-stone-700 dark:text-stone-300"
                        >
                          {l}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(index)}
                  className="h-8 gap-1.5 px-2 text-xs text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                  aria-label={`${editText} ${index + 1}`}
                >
                  <PencilLine className="h-3.5 w-3.5" aria-hidden />
                  {editText}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onEdit(0)} disabled={submitting}>
          {backText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  );
}
