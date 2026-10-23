/**
 * Rafi9i — Dashboard home (Developer 2)
 * Greeting, profile completion, trial status, orientation stage, primary
 * field match, weekly challenge, roadmap progress, completed resources,
 * streak, next recommended action. Limited view for free plan.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Crown,
  Flame,
  Map,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreRing } from "@/components/shared/ScoreBar";
import StatCard from "@/components/dashboard/StatCard";
import TrialChip from "@/components/dashboard/TrialChip";
import PremiumUpsell from "@/components/results/PremiumUpsell";
import WeeklyChallengeCard from "@/components/resources/WeeklyChallengeCard";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { dashboardIsLimited } from "@/lib/access";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const { t, locale } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    api.dashboard
      .get()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "dsh.home.loadError"))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (loading || !session) return <PageLoader message={t("dash.opening")} />;
  if (fetching) return <PageLoader message={t("dsh.home.gathering")} />;

  if (error || !data) {
    return (
      <div className="py-6">
        <ErrorState
          title={t("dsh.home.unavailable")}
          description={error ? t(error) : t("dsh.home.noData")}
          onRetry={load}
          onDemoFallback={() => {
            setData(demoFallbackDashboard(t));
            setError("");
          }}
        />
      </div>
    );
  }

  const limited = dashboardIsLimited(data.trial);
  const challenge = data.weeklyChallenge;
  const firstName = session.user.name.split(" ")[0];
  const intlLocale = locale === "ar" || locale === "ary" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
  const today = new Intl.DateTimeFormat(intlLocale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="space-y-6 pb-10">
      {/* Greeting */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium capitalize text-muted-foreground">{today}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-foreground">{t("dsh.home.greeting", { name: firstName })}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <TrialChip />
        </div>
      </header>

      <FoxGuide
        stage="dashboard"
        mood="encouraging"
        compact
        message={data.nextAction}
      />

      {/* Stat grid */}
      <section aria-label={t("dsh.home.statsLabel")} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("dsh.home.profile")}</p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <ScoreRing value={data.profileCompletion} size={52} />
            <p className="text-xs leading-snug text-muted-foreground">{t("dsh.home.completed")}</p>
          </div>
        </div>
        <StatCard
          icon={Flame}
          label={t("dsh.home.streak")}
          value={t("dsh.home.streakValue", { count: data.streak })}
          hint={t("dsh.home.streakHint")}
          accent
        />
        <StatCard
          icon={BookOpen}
          label={t("dsh.home.resources")}
          value={`${data.completedResources}`}
          hint={t("dsh.home.resourcesHint")}
        />
        <StatCard
          icon={Map}
          label={t("dsh.home.roadmap")}
          value={`${data.roadmapProgress}%`}
          hint={t("dsh.home.roadmapHint")}
        />
      </section>

      {/* Orientation stage + primary field */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Compass className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
              {t("dsh.home.stage")}
            </h2>
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-orange-700 dark:text-orange-400">
              <Link href="/dashboard/orientation">
                {t("dsh.details")} <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{data.orientationStage}</p>
          <Progress
            value={
              data.primaryField ? 70 : 20
            }
            className="mt-3"
            aria-label={t("dsh.home.stageProgress")}
          />
        </div>

        {data.primaryField ? (
          <FieldMatchCard field={data.primaryField} primary={false} />
        ) : (
          <div className="flex flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-5 dark:border-orange-900/60 dark:bg-orange-950/30">
            <p className="text-sm font-semibold text-foreground">{t("dsh.home.noOrientation.title")}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("dsh.home.noOrientation.body")}</p>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/assessment/basic">
                {t("dsh.start")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Weekly challenge */}
      {challenge && (
        <WeeklyChallengeCard
          challenge={challenge}
          completed={store.weeklyChallengeCompleted}
          onToggle={(done) => store.setWeeklyChallengeCompleted(done)}
        />
      )}

      {/* Next action */}
      <section className="flex items-start gap-3 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm dark:border-orange-900/60 dark:from-orange-950/50 dark:to-amber-950/30">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">
            {t("dsh.home.nextAction")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{data.nextAction}</p>
        </div>
      </section>

      {/* Plan upsell / premium status */}
      {limited ? (
        <PremiumUpsell />
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-300 bg-card p-5 shadow-sm dark:border-orange-900/60">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
              {t("dsh.home.premiumActive")}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("dsh.home.premiumActiveBody")}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/results/premium">
              {t("dsh.seePremiumResult")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

/* Minimal fallback when the dashboard is completely unavailable. */
function demoFallbackDashboard(t: (key: string) => string): DashboardData {
  return {
    profileCompletion: 25,
    trial: { status: "not_started", startedAt: null, expiresAt: null, daysRemaining: 0, accessLevel: "free" },
    orientationStage: t("dsh.home.fallback.stage"),
    primaryField: null,
    weeklyChallenge: null,
    roadmapProgress: 0,
    completedResources: 0,
    streak: 0,
    nextAction: t("dsh.home.fallback.next"),
  };
}
