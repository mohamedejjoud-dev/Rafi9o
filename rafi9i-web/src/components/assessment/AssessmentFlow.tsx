/**
 * Rafi9i — Assessment flow orchestrator (Developer 2)
 * -----------------------------------------------------
 * Shared engine for the basic (12 questions) and advanced (10 questions)
 * assessments: intro → one question per screen → review → submission.
 *
 * - React Hook Form holds session state; Zustand persists draft answers
 *   so navigating backward/away never loses data.
 * - Zod validates the full payload before submission.
 * - Loading + error + demo-fallback states are built-in.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import QuestionCard from "@/components/assessment/QuestionCard";
import ReviewSummary from "@/components/assessment/ReviewSummary";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import DemoBadge from "@/components/shared/DemoBadge";
import BackButton from "@/components/shared/BackButton";
import { useAssessmentStore } from "@/lib/assessment-store";
import type { AssessmentQuestion } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type FlowPhase = "intro" | "questions" | "review" | "submitting" | "error";

interface ZodLike {
  safeParse: (
    v: unknown
  ) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } };
}

/** Question slide: enters from the reading direction, leaves the other way. */
const QUESTION_SLIDE = {
  enter: (dir: number) => ({ opacity: 0, x: 28 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -28 * dir }),
};

export interface AssessmentFlowProps {
  variant: "basic" | "advanced";
  title: string;
  introMessage: string;
  loadingMessage: string;
  questions: AssessmentQuestion[];
  schema: ZodLike;
  submit: (answers: Record<string, unknown>) => unknown;
  demoSubmit: (answers: Record<string, unknown>) => unknown;
  successRoute: string;
  onSubmitted?: () => void;
}

const SUBMIT_MESSAGES_MAP: Record<string, string[]> = {
  ar: [
    "يقوم رافي بتحليل إجاباتك…",
    "مقارنة مع الشعب والمدارس العليا بالمغرب…",
    "حساب نسب التوافق لملفك…",
    "صياغة التوصيات المخصصة…",
  ],
  en: [
    "Rafi is analyzing your answers…",
    "Comparing with Moroccan universities…",
    "Calculating compatibility scores…",
    "Drafting your personalized recommendations…",
  ],
  fr: [
    "Rafi analyse tes réponses…",
    "Comparaison avec les filières marocaines…",
    "Calcul de tes scores de compatibilité…",
    "Rédaction de tes recommandations…",
  ],
};

export default function AssessmentFlow({
  variant,
  title,
  introMessage,
  loadingMessage,
  questions,
  schema,
  submit,
  demoSubmit,
  successRoute,
  onSubmitted,
}: AssessmentFlowProps) {
  const router = useRouter();
  // Select only what this component needs so unrelated store updates
  // (favorites, challenges) don't re-render the whole quiz.
  const setDraftAnswer = useAssessmentStore((s) => (variant === "basic" ? s.setBasicAnswer : s.setAdvancedAnswer));
  const resetDraft = useAssessmentStore((s) => (variant === "basic" ? s.resetBasic : s.resetAdvanced));
  const setProgress = useAssessmentStore((s) => s.setProgress);
  const { t, locale, dir } = useI18n();

  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>("intro");
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string>("");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [resumed, setResumed] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const form = useForm<Record<string, unknown>>({ defaultValues: {} });
  /* Hydrate draft answers and the saved position once on mount (client-only
     storage), so a refresh resumes at the same question. */
  useEffect(() => {
    const state = useAssessmentStore.getState();
    const answers = variant === "basic" ? state.basic : state.advanced;
    form.reset({ ...answers });
    const saved = state.progress[variant];
    if (saved && Object.keys(answers).length > 0 && questions.length > 0) {
      setStep(Math.min(Math.max(saved.step, 0), questions.length - 1));
      setPhase(saved.phase);
      setResumed(true);
    }
    setHydrated(true);
  }, [variant]);

  /* Remember the position while answering. */
  useEffect(() => {
    if (!hydrated) return;
    if (phase === "questions" || phase === "review") setProgress(variant, { step, phase });
  }, [hydrated, phase, step, variant, setProgress]);

  const submitMessages = SUBMIT_MESSAGES_MAP[locale] || SUBMIT_MESSAGES_MAP.fr;

  /* Rotate loading messages during result generation. */
  useEffect(() => {
    if (phase !== "submitting") return;
    const timer = setInterval(() => setLoadingMsgIndex((i) => (i + 1) % submitMessages.length), 1400);
    return () => clearInterval(timer);
  }, [phase, submitMessages.length]);

  const total = questions.length;
  const currentQuestion: AssessmentQuestion | undefined = questions[step];
  const progress = Math.round((step / Math.max(1, total)) * 100);

  /* Single-choice and scale answers advance on their own after a short pause
     so the student sees the selection; multi-select questions keep "Next". */
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = null;
  }, []);
  useEffect(() => cancelAutoAdvance, [cancelAutoAdvance]);

  const handleChange = useCallback(
    (question: AssessmentQuestion, value: unknown) => {
      form.setValue(question.id, value);
      setDraftAnswer(question.id as never, value);
      setStepError(undefined);

      if (question.type === "multi" || value === undefined || value === "") return;
      const answeredIndex = questions.findIndex((q) => q.id === question.id);
      cancelAutoAdvance();
      autoAdvanceTimer.current = setTimeout(() => {
        autoAdvanceTimer.current = null;
        setDirection(1);
        if (answeredIndex >= questions.length - 1) {
          setPhase("review");
        } else {
          setStep(answeredIndex + 1);
        }
      }, 350);
    },
    [form, setDraftAnswer, questions, cancelAutoAdvance]
  );

  const validateCurrent = useCallback((): boolean => {
    if (!currentQuestion) return true;
    const value = form.getValues(currentQuestion.id);
    const missing =
      currentQuestion.type === "multi"
        ? !Array.isArray(value) || value.length === 0
        : value === undefined || value === "";
    if (missing) {
      const err =
        currentQuestion.type === "multi"
          ? locale === "ar"
            ? "اختر خياراً واحداً على الأقل للمتابعة."
            : locale === "en"
                ? "Select at least one option to continue."
                : "Sélectionne au moins une option pour continuer."
          : locale === "ar"
            ? "اختر إجابة للمتابعة."
            : locale === "en"
                ? "Choose an answer to continue."
                : "Choisis une réponse pour continuer.";
      setStepError(err);
      return false;
    }
    return true;
  }, [currentQuestion, form, locale]);

  const goNext = useCallback(() => {
    cancelAutoAdvance();
    if (!validateCurrent()) return;
    setStepError(undefined);
    setDirection(1);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setPhase("review");
    }
  }, [step, total, validateCurrent, cancelAutoAdvance]);

  const goBack = useCallback(() => {
    cancelAutoAdvance();
    setStepError(undefined);
    setDirection(-1);
    setResumed(false);
    if (step > 0) setStep(step - 1);
    else setPhase("intro");
  }, [step, cancelAutoAdvance]);

  /* "Restart quiz": clear answers and the saved position. Questions are not
     re-fetched: they are a fixed catalog already loaded for this session. */
  const restart = useCallback(() => {
    cancelAutoAdvance();
    resetDraft();
    form.reset({});
    setStep(0);
    setDirection(1);
    setStepError(undefined);
    setResumed(false);
    setConfirmRestart(false);
    setPhase("intro");
  }, [cancelAutoAdvance, resetDraft, form]);

  const doSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setPhase("submitting");
      setSubmitError("");
      try {
        await submit(values);
        onSubmitted?.();
        router.push(successRoute);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : locale === "ar"
              ? "تعذر توليد النتيجة حالياً."
              : locale === "en"
                  ? "Unable to generate your result right now."
                  : "Impossible de générer ton résultat pour le moment."
        );
        setPhase("error");
      }
    },
    [submit, onSubmitted, router, successRoute, locale]
  );

  const confirmSubmit = useCallback(() => {
    const values = form.getValues();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error?.issues?.[0];
      const field = firstIssue ? String(firstIssue.path[0] ?? "") : "";
      const idx = questions.findIndex((q) => q.id === field);
      if (idx >= 0) setStep(idx);
      setStepError(
        firstIssue?.message ??
          (locale === "ar"
            ? "يرجى الإجابة على جميع الأسئلة قبل المتابعة."
            : locale === "en"
                ? "Complete all questions before proceeding."
                : "Complète toutes les questions avant de continuer.")
      );
      setPhase("questions");
      return;
    }
    void doSubmit(values);
  }, [form, schema, questions, doSubmit, locale]);

  const demoFallback = useCallback(() => {
    void (async () => {
      setPhase("submitting");
      try {
        await demoSubmit(form.getValues());
        onSubmitted?.();
        router.push(successRoute);
      } catch {
        setSubmitError(
          locale === "ar"
            ? "الوضع التجريبي غير متاح أيضاً حالياً."
            : locale === "en"
                ? "Demo mode is also currently unavailable."
                : "Le mode démo est également indisponible pour le moment."
        );
        setPhase("error");
      }
    })();
  }, [demoSubmit, form, onSubmitted, router, successRoute, locale]);

  if (!hydrated) {
    const loaderMsg =
      locale === "ar"
        ? "رافي يسترجع مسودتك…"
        : locale === "en"
            ? "Rafi is retrieving your draft…"
            : "Rafi récupère ton brouillon…";
    return <PageLoader message={loaderMsg} />;
  }

  /* ---------------------------- Intro ---------------------------- */
  if (phase === "intro") {
    const startText =
      locale === "ar" ? "ابدأ الآن" : locale === "en" ? "Start" : "Commencer";
    const introDesc =
      locale === "ar"
        ? `${total} أسئلة · حوالي 10 دقائق · تُحفظ إجاباتك تلقائياً. يمكنك مراجعة الملخص قبل تأكيد النتائج.`
        : locale === "en"
            ? `${total} questions · approx. 10 minutes · answers saved automatically. You can review your summary before finalizing.`
            : `${total} questions · environ 10 minutes · tes réponses sont sauvegardées automatiquement. Tu pourras vérifier un récapitulatif avant de générer ton résultat.`;

    const point1 =
      locale === "ar"
        ? "سؤال واحد في كل شاشة بدون ضغط."
        : locale === "en"
            ? "One question at a time, stress-free."
            : "Une question à la fois, sans pression.";

    const point2 =
      locale === "ar"
        ? "أجب بعفوية: لا توجد إجابات خاطئة."
        : locale === "en"
            ? "Answer spontaneously: there are no wrong answers."
            : "Réponds spontanément : il n'y a pas de mauvaise réponse.";

    const point3 =
      locale === "ar"
        ? "رافي يستنتج الشعب ونقاط قوتك الأنسب."
        : locale === "en"
            ? "Rafi deduces your best-fit fields and strengths."
            : "Rafi en déduit tes filières et forces prioritaires.";

    return (
      <div className="mx-auto w-full max-w-2xl" dir={dir}>
        <DemoBadge className="mb-4" />
        <div className="rounded-3xl border border-orange-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm sm:p-8">
          <FoxGuide stage="assessment" mood="encouraging" message={introMessage} />
          <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {introDesc}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-[10px] font-bold text-orange-700 dark:text-orange-400">1</span>
              {point1}
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-[10px] font-bold text-orange-700 dark:text-orange-400">2</span>
              {point2}
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-[10px] font-bold text-orange-700 dark:text-orange-400">3</span>
              {point3}
            </li>
          </ul>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
            <BackButton size="lg" />
            <Button size="lg" onClick={() => setPhase("questions")} className="w-full gap-2 sm:w-auto">
              {startText} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------- Review ----------------------------- */
  if (phase === "review") {
    return (
      <ReviewSummary
        questions={questions}
        values={form.getValues()}
        onEdit={(index) => {
          setStep(index);
          setPhase("questions");
        }}
        onBack={() => {
          setStep(total - 1);
          setPhase("questions");
        }}
        onConfirm={confirmSubmit}
        submitting={false}
      />
    );
  }

  /* ------------------------ Submitting --------------------------- */
  if (phase === "submitting") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center" role="status" aria-live="polite" dir={dir}>
        <FoxGuide stage="assessment" mood="thinking" message={submitMessages[loadingMsgIndex]} />
        <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">{loadingMessage}</p>
        <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-orange-100 dark:bg-stone-800">
          <motion.div
            className="h-full w-1/3 rounded-full bg-orange-500"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  /* -------------------------- Error ------------------------------ */
  if (phase === "error") {
    const errorSuffix =
      locale === "ar"
        ? "تم حفظ تقدمك — لم تفقد أي بيانات."
        : locale === "en"
            ? "Your progress is saved — nothing is lost."
            : "Ta progression est sauvegardée — rien n'est perdu.";
    return (
      <div className="py-10" dir={dir}>
        <ErrorState
          description={`${submitError} ${errorSuffix}`}
          onRetry={() => confirmSubmit()}
          onDemoFallback={demoFallback}
        />
      </div>
    );
  }

  /* ------------------------- Questions --------------------------- */
  const questionNumLabel =
    locale === "ar"
      ? `السؤال ${step + 1} / ${total}`
      : locale === "en"
          ? `Question ${step + 1} / ${total}`
          : `Question ${step + 1} / ${total}`;

  const foxHint = stepError
    ? locale === "ar"
      ? "لا تقلق: اختر إجابة وسنكمل فوراً!"
      : locale === "en"
          ? "No worries: pick an answer and let's keep going!"
          : "Pas d'inquiétude : choisis une réponse et on continue !"
    : step > total / 2
      ? locale === "ar"
        ? "تجاوزت النصف، رائع! واصل هكذا."
        : locale === "en"
            ? "Already halfway through, great job! Keep it up."
            : "Déjà la moitié, tu gères ! Continue comme ça."
      : locale === "ar"
        ? "خذ وقتك، لا توجد إجابات خاطئة."
        : locale === "en"
            ? "Take your time, there are no wrong answers."
            : "Prends ton temps, il n'y a pas de mauvaise réponse.";

  const backLabel =
    locale === "ar" ? "رجوع" : locale === "en" ? "Back" : "Retour";

  const nextLabel =
    locale === "ar" ? "التالي" : locale === "en" ? "Next" : "Suivant";

  const reviewLabel =
    locale === "ar"
      ? "عرض الملخص"
      : locale === "en"
          ? "Review Summary"
          : "Voir le récapitulatif";

  return (
    <div className="mx-auto w-full max-w-2xl" dir={dir}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DemoBadge />
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400" aria-live="polite">
            {questionNumLabel}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setConfirmRestart(true)} className="gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t("asm.restart")}
        </Button>
      </div>
      {resumed && (
        <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400" role="status">
          {t("asm.resumed")}
        </p>
      )}

      {/* Progress indicator */}
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-stone-800"
        role="progressbar"
        aria-valuenow={Math.round(((step + 1) / total) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("asm.progressLabel")}
      >
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-to-r from-amber-400 to-orange-600 rtl:origin-right"
          initial={false}
          animate={{ scaleX: (step + 1) / Math.max(1, total) }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="mt-6">
        <FoxGuide
          stage="assessment"
          mood={stepError ? "concerned" : step > total / 2 ? "celebrating" : "encouraging"}
          progress={progress}
          compact
          message={foxHint}
        />
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction * (dir === "rtl" ? -1 : 1)}>
      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          custom={direction * (dir === "rtl" ? -1 : 1)}
          variants={QUESTION_SLIDE}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm sm:p-7">
          <h1
            id={`q-${currentQuestion.id}`}
            className="text-lg font-bold leading-snug text-stone-900 dark:text-stone-100 sm:text-xl"
          >
            {currentQuestion.question}
          </h1>
          {currentQuestion.helper && (
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">{currentQuestion.helper}</p>
          )}
          <div className="mt-5">
            <QuestionCard
              question={currentQuestion}
              value={form.watch(currentQuestion.id)}
              error={stepError}
              onChange={(v) => handleChange(currentQuestion, v)}
            />
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="sticky bottom-4 mt-5 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 p-3 shadow-lg backdrop-blur">
        <Button variant="outline" onClick={goBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {backLabel}
        </Button>
        <Button
          onClick={goNext}
          className="gap-1.5"
          aria-label={step === total - 1 ? reviewLabel : nextLabel}
        >
          {step === total - 1 ? (
            <>
              <ClipboardList className="h-4 w-4" aria-hidden />
              {reviewLabel}
            </>
          ) : (
            <>
              {nextLabel} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={confirmRestart} onOpenChange={setConfirmRestart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("asm.restart.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("asm.restart.text")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("asm.restart.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={restart}>{t("asm.restart.ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
