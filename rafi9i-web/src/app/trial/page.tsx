/**
 * Rafi9i — Premium page
 * States: free → pending (WhatsApp payment sent, awaiting admin verification)
 * → subscribed, plus expired. The 3-day preview ("active") exists only in
 * demo mode and is started from the demo tools on this page.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Crown, FlaskConical, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import BenefitsList from "@/components/trial/BenefitsList";
import TrialCountdown from "@/components/trial/TrialCountdown";
import UpgradeButton from "@/components/trial/UpgradeButton";
import DemoTrialTools from "@/components/trial/DemoTrialTools";
import { api, getApiMode, onApiModeChange, type ApiMode } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { startTrial as startDemoPreview } from "@/lib/mocks";
import { formatPremiumDate } from "@/lib/premium";
import type { LatestResult, TrialStatus } from "@/lib/types";

const STEPS = ["premium.step1", "premium.step2", "premium.step3"] as const;

export default function PremiumPage() {
  const { session, loading } = useRequireAuth();
  const { t, locale, dir } = useI18n();

  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [checking, setChecking] = useState(false);
  const [apiMode, setApiMode] = useState<ApiMode>("live");

  useEffect(() => {
    setApiMode(getApiMode());
    return onApiModeChange(setApiMode);
  }, []);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    Promise.all([api.trial.status(), api.results.latest()])
      .then(([status, result]) => {
        setTrial(status);
        setLatest(result);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("premium.toast.error")))
      .finally(() => setFetching(false));
  }, [t]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const checkStatus = () => {
    setChecking(true);
    api.trial
      .status()
      .then(setTrial)
      .catch(() => undefined)
      .finally(() => setChecking(false));
  };

  if (loading || !session) return <PageLoader message={t("premium.loading")} />;

  const isDemo = apiMode === "demo";
  const advancedDone = latest?.kind === "premium";
  const premiumNextStep = advancedDone ? (
    <Button asChild className="flex-1 gap-2">
      <Link href="/results/premium">
        {t("premium.cta.result")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Link>
    </Button>
  ) : (
    <Button asChild className="flex-1 gap-2">
      <Link href="/assessment/advanced">
        {t("premium.cta.advanced")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Link>
    </Button>
  );

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8 dark:bg-slate-950" dir={dir}>
      <div className="mx-auto max-w-3xl space-y-6">
        {isDemo && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DemoBadge />
            <DemoTrialTools onChanged={load} />
          </div>
        )}

        {fetching && <PageLoader message={t("premium.loading")} />}

        {!fetching && error && <ErrorState description={error} onRetry={load} />}

        {!fetching && !error && trial && (
          <>
            {trial.status === "subscribed" && (
              <section className="rounded-3xl border border-orange-300 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-md sm:p-8 dark:border-orange-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                <FoxGuide stage="trial" mood="celebrating" message={t("premium.active.text")} />
                <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                  <Crown className="h-3.5 w-3.5" aria-hidden />
                  {t("premium.badge")}
                </span>
                <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-white">{t("premium.active.title")}</h1>
                <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
                  {trial.expiresAt
                    ? `${t("premium.active.until")} ${formatPremiumDate(trial.expiresAt, locale)}`
                    : t("premium.active.unlimited")}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {premiumNextStep}
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/dashboard">{t("premium.cta.dashboard")}</Link>
                  </Button>
                </div>
              </section>
            )}

            {trial.status === "active" && (
              /* Demo-only 3-day preview */
              <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      <FlaskConical className="h-3.5 w-3.5" aria-hidden />
                      {t("premium.demo.active")}
                    </span>
                    <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-white">{t("premium.active.title")}</h1>
                    <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
                      {t("premium.demo.until")} {formatPremiumDate(trial.expiresAt, locale)}
                    </p>
                  </div>
                  {trial.expiresAt && <TrialCountdown expiresAt={trial.expiresAt} />}
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {premiumNextStep}
                  <UpgradeButton variant="outline" className="flex-1" onRequested={setTrial} />
                </div>
              </section>
            )}

            {trial.status === "pending" && (
              <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8 dark:border-amber-900/50 dark:bg-slate-900">
                <FoxGuide stage="trial" mood="encouraging" message={t("premium.pending.text")} />
                <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {t("premium.pending.badge")}
                </span>
                <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-white">{t("premium.pending.title")}</h1>
                {trial.requestedAt && (
                  <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
                    {t("premium.pending.since")} {formatPremiumDate(trial.requestedAt, locale)}
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button onClick={checkStatus} disabled={checking} className="flex-1 gap-2">
                    <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden />
                    {t("premium.cta.check")}
                  </Button>
                  <UpgradeButton variant="outline" className="flex-1" label={t("premium.cta.reopen")} />
                </div>
                <p className="mt-4 text-xs text-stone-500 dark:text-slate-400">{t("premium.free.keeps")}</p>
              </section>
            )}

            {(trial.status === "not_started" || trial.status === "expired") && (
              <section className="space-y-5">
                <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                  <FoxGuide
                    stage="trial"
                    mood={trial.status === "expired" ? "concerned" : "encouraging"}
                    message={trial.status === "expired" ? t("premium.expired.text") : t("ai.locked.text")}
                  />
                  <h1 className="mt-6 flex items-center gap-2 text-2xl font-bold text-stone-900 dark:text-white">
                    <Crown className="h-6 w-6 text-orange-600" aria-hidden />
                    {trial.status === "expired" ? t("premium.expired.title") : t("premium.page.title")}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                    {t("premium.page.subtitle")}
                  </p>
                  <p className="mt-4 text-3xl font-extrabold text-stone-900 dark:text-white">{t("premium.price")}</p>
                  <UpgradeButton size="lg" className="mt-4 w-full sm:w-auto" onRequested={setTrial} />
                  <p className="mt-3 text-xs text-stone-500 dark:text-slate-400">{t("premium.free.keeps")}</p>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-base font-bold text-stone-900 dark:text-white">{t("premium.steps.title")}</h2>
                  <ol className="mt-4 space-y-4">
                    {STEPS.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">{t(`${step}.title`)}</h3>
                          <p className="mt-0.5 text-sm leading-relaxed text-stone-600 dark:text-slate-400">{t(`${step}.text`)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <BenefitsList columns={2} />

                {isDemo && trial.status === "not_started" && (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-stone-500 dark:text-slate-400">{t("premium.demo.note")}</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => setTrial(startDemoPreview())}>
                      <FlaskConical className="h-4 w-4" aria-hidden />
                      {t("premium.demo.start")}
                    </Button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
