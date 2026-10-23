/**
 * Rafi9i — Dashboard · Orientation (Developer 2)
 * Assessment status, top field matches, fields explored, saved selections.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, CheckCircle2, CircleDashed, Compass, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar } from "@/components/shared/ScoreBar";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { formatDate, isPremiumAccess } from "@/lib/access";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import { FIELDS_CATALOG } from "@/lib/mocks";
import type { LatestResult, TrialStatus } from "@/lib/types";

const DONE_CARD = "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/30";

export default function OrientationPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const { t, locale } = useI18n();
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.results.latest(), api.trial.status()])
      .then(([r, status]) => {
        setLatest(r);
        setTrial(status);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "dsh.loadError"))
      .finally(() => setFetching(false));
  }, [session]);

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;
  if (fetching) return <PageLoader message={t("dsh.ori.loading")} />;

  if (error) {
    return (
      <div className="py-6">
        <ErrorState description={t(error)} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const basicDone = latest !== null;
  const premiumDone = latest?.kind === "premium";
  const topFields = latest?.result.topFields ?? [];
  const exploredIds = new Set(topFields.map((f) => f.id));
  const hasPremium = trial !== null && isPremiumAccess(trial);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            {t("dash.orientation")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.ori.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      {/* Assessment status */}
      <section aria-labelledby="status-title" className="grid gap-3 sm:grid-cols-2">
        <h2 id="status-title" className="sr-only">{t("dsh.ori.statusTitle")}</h2>
        <div className={`rounded-2xl border p-5 ${basicDone ? DONE_CARD : "border-border bg-card"}`}>
          <div className="flex items-center gap-2">
            {basicDone ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <CircleDashed className="h-5 w-5 text-muted-foreground" aria-hidden />
            )}
            <h3 className="text-sm font-bold text-foreground">{t("dsh.ori.basic")}</h3>
            <span className="ms-auto text-[11px] font-semibold text-muted-foreground">{t("dsh.free")}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {basicDone ? t("dsh.doneOn", { date: formatDate(latest.generatedAt, locale) }) : t("dsh.ori.basicTodo")}
          </p>
          <Button asChild size="sm" variant={basicDone ? "outline" : "default"} className="mt-3">
            <Link href={basicDone ? "/results/free" : "/assessment/basic"}>
              {basicDone ? t("dsh.ori.reviewResult") : t("dsh.start")}{" "}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            premiumDone
              ? DONE_CARD
              : hasPremium
                ? "border-orange-300 bg-orange-50/50 dark:border-orange-900/60 dark:bg-orange-950/30"
                : "border-border bg-card"
          }`}
        >
          <div className="flex items-center gap-2">
            {premiumDone ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
            )}
            <h3 className="text-sm font-bold text-foreground">{t("dsh.ori.advanced")}</h3>
            <span className="ms-auto text-[11px] font-semibold text-orange-700 dark:text-orange-300">{t("dsh.premium")}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {premiumDone
              ? t("dsh.doneOn", { date: formatDate(latest.generatedAt, locale) })
              : hasPremium
                ? t("dsh.ori.advancedIncluded")
                : t("dsh.ori.advancedLocked")}
          </p>
          <Button asChild size="sm" variant={premiumDone ? "outline" : "default"} className="mt-3">
            <Link href={premiumDone ? "/results/premium" : hasPremium ? "/assessment/advanced" : "/trial"}>
              {premiumDone ? t("dsh.seePremiumResult") : hasPremium ? t("dsh.ori.takeAssessment") : t("dsh.unlock")}{" "}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Top matches */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="top-matches">
        <h2 id="top-matches" className="text-sm font-bold text-foreground">{t("dsh.ori.topMatches")}</h2>
        {topFields.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("dsh.ori.noMatches")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {topFields.map((f) => (
              <li key={f.id}>
                <ScoreBar value={f.score} label={f.name} highlight={f.id === topFields[0].id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fields explored */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="explored">
        <h2 id="explored" className="text-sm font-bold text-foreground">{t("dsh.ori.explored")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("dsh.ori.exploredBody")}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FIELDS_CATALOG.map((f) => (
            <li
              key={f.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                exploredIds.has(f.id)
                  ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {exploredIds.has(f.id) && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
              {f.name}
              {exploredIds.has(f.id) && <span className="text-[10px] font-bold uppercase">{t("dsh.ori.exploredTag")}</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Saved selections */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="saved-selections">
        <div className="flex items-center justify-between">
          <h2 id="saved-selections" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Bookmark className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
            {t("dsh.ori.saved")}
          </h2>
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-orange-700 dark:text-orange-400">
            <Link href="/dashboard/saved">
              {t("dsh.seeAll")} <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
        {store.savedFields.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("dsh.ori.noSaved")}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {topFields
              .filter((f) => store.savedFields.includes(f.id))
              .map((f) => (
                <FieldMatchCard
                  key={f.id}
                  field={f}
                  saved
                  onToggleSave={() => store.toggleSavedField(f.id)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
