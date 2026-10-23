/**
 * Rafi9i — Free result page (Developer 2)
 * Useful by design: 3 fields, real scores, primary explanation,
 * 3 strengths, 1 soft skill, 1 next action + Premium Preview CTA.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, ClipboardList, Compass, Lightbulb, Lock, MapPin, Rocket, Sparkles, Sprout, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar } from "@/components/shared/ScoreBar";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import StrengthsBadges from "@/components/results/StrengthsBadges";
import PremiumUpsell from "@/components/results/PremiumUpsell";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { BASIC_QUESTIONS, optionLabel } from "@/lib/mocks";
import type { LatestResult, TrialStatus } from "@/lib/types";
import { useI18n, type Locale } from "@/lib/i18n";

/** Sentinel for failures without a server message; rendered as a translated fallback. */
const LOAD_FAILED = "__load_failed__";

const INTL_LOCALES: Record<Locale, string> = { fr: "fr-FR", en: "en-GB", ar: "ar-MA" };

export default function FreeResultPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const store = useAssessmentStore();
  const { t, locale } = useI18n();

  const [result, setResult] = useState<LatestResult | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    Promise.all([api.results.latest(), api.trial.status()])
      .then(([latest, trialStatus]) => {
        setResult(latest);
        setTrial(trialStatus);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : LOAD_FAILED))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  /* Already upgraded → send to the full result */
  useEffect(() => {
    if (result?.kind === "premium") router.replace("/results/premium");
  }, [result, router]);

  if (loading || !session) return <PageLoader message={t("asm.loadingSpace")} />;

  if (fetching) return <PageLoader message={t("asm.free.fetching")} />;

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-10">
        <ErrorState
          title={t("asm.free.unavailable")}
          description={t("asm.free.errorDesc", { error: error === LOAD_FAILED ? t("asm.free.loadError") : error })}
          onRetry={load}
          onDemoFallback={() => {
            setResult(demoBackend.getLatestResult());
            setTrial(demoBackend.getTrialStatus());
            setError("");
          }}
        />
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-10">
        <div className="mx-auto max-w-xl text-center">
          <FoxGuide
            stage="results"
            mood="thinking"
            message={t("asm.free.empty")}
          />
          <Button asChild className="mt-6 gap-2">
            <Link href="/assessment/basic">
              {t("asm.free.startCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { result: orientation } = result;
  const primary = orientation.topFields[0];
  const fallbackDemo = () => {
    const demo = demoBackend.getLatestResult();
    if (demo) setResult(demo);
  };

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBadge />
          {result.source === "fallback" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              {t("asm.fallbackNotice")}
            </span>
          )}
        </div>

        <FoxGuide
          stage="results"
          mood="celebrating"
          progress={100}
          message={t("asm.free.congrats", { name: session.user.name.split(" ")[0] })}
        />

        {/* Profile summary */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="profile-summary">
          <h2 id="profile-summary" className="flex items-center gap-2 text-base font-bold text-foreground">
            <UserRound className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
            {t("asm.free.profileTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{orientation.profileSummary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1 text-foreground">
              <MapPin className="me-1 inline h-3.5 w-3.5" aria-hidden />{optionLabel(BASIC_QUESTIONS, "city", session.user.city ?? "") || t("asm.free.noCity")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-foreground">
              <ClipboardList className="me-1 inline h-3.5 w-3.5" aria-hidden />{t("asm.free.answersAnalyzed", { n: 12 })}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-foreground">
              <CalendarDays className="me-1 inline h-3.5 w-3.5" aria-hidden />{t("asm.free.generatedOn", { date: new Date(result.generatedAt).toLocaleDateString(INTL_LOCALES[locale]) })}
            </span>
          </div>
        </section>

        {/* Top 3 fields */}
        <section aria-labelledby="top-fields" className="space-y-3">
          <h2 id="top-fields" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Compass className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
            {t("asm.free.topFields")}
          </h2>
          {orientation.topFields.map((field, index) => (
            <FieldMatchCard
              key={field.id}
              field={field}
              primary={index === 0}
              detailed={index === 0}
              saved={store.savedFields.includes(field.id)}
              onToggleSave={() => store.toggleSavedField(field.id)}
            />
          ))}
          <p className="text-xs text-muted-foreground">
            {t("asm.free.scoreNote")}
          </p>
        </section>

        {/* Strengths */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="strengths">
          <h2 id="strengths" className="text-base font-bold text-foreground">
            <Sparkles className="me-1.5 inline h-4 w-4 text-amber-500" aria-hidden />{t("asm.free.strengths")}
          </h2>
          <div className="mt-3">
            <StrengthsBadges strengths={orientation.strengths} />
          </div>
        </section>

        {/* Soft skill to improve */}
        {orientation.softSkillPriorities[0] && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="soft-skill">
            <h2 id="soft-skill" className="text-base font-bold text-foreground">
              <Sprout className="me-1.5 inline h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />{t("asm.free.softSkill")}
            </h2>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{orientation.softSkillPriorities[0].name}</h3>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{t("asm.level", { n: orientation.softSkillPriorities[0].currentLevel })}</span>
              </div>
              <ScoreBar value={orientation.softSkillPriorities[0].currentLevel} className="mt-1.5" />
              <p className="mt-2 text-sm text-muted-foreground">{orientation.softSkillPriorities[0].reason}</p>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/40">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
                <p className="text-xs leading-relaxed text-foreground">
                  <span className="font-semibold">{t("asm.free.weeklyAction")}</span>{" "}
                  {orientation.softSkillPriorities[0].action}
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("asm.free.softLocked")}
            </p>
          </section>
        )}

        {/* Next action */}
        <section className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm dark:border-orange-900/50 dark:from-orange-950/40 dark:to-amber-950/30">
          <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
          <div>
            <h2 className="text-base font-bold text-foreground">{t("asm.free.nextAction")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{primary?.nextAction}</p>
          </div>
        </section>

        {/* Premium CTA */}
        <PremiumUpsell />

        <div className="pb-6 text-center">
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/dashboard">{t("asm.free.toDashboard")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
