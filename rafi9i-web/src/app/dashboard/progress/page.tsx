/**
 * Rafi9i — Dashboard · Progress (Developer 2)
 * Overall progress, resource completion, soft-skill activity completion,
 * roadmap completion + a simple activity chart.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, Sparkles, TrendingUp, UserRound } from "lucide-react";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar, ScoreRing } from "@/components/shared/ScoreBar";
import dynamic from "next/dynamic";

/* recharts is heavy: load the chart after the page content. */
const TrendChart = dynamic(() => import("@/components/progress/TrendChart"), {
  ssr: false,
  loading: () => <div className="h-52 w-full animate-pulse rounded-xl bg-muted" />,
});
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import { WEEKLY_ACTIVITY } from "@/lib/mocks";
import type { DashboardData, LatestResult } from "@/lib/types";

export default function ProgressPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const { t } = useI18n();
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.results.latest(), api.dashboard.get()])
      .then(([r, d]) => {
        setLatest(r);
        setDashboard(d);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "dsh.loadError"))
      .finally(() => setFetching(false));
  }, [session]);

  const categories = useMemo(() => {
    const premium = latest?.kind === "premium" ? latest.result : null;
    const resources = premium
      ? Math.round((premium.resources.filter((r) => r.completed).length / Math.max(1, premium.resources.length)) * 100)
      : 0;
    const softSkills = premium
      ? Math.round(
          ((premium.softSkillPriorities.filter((s) => store.completedSoftSkillActions.includes(s.id)).length +
            (store.weeklyChallengeCompleted ? 1 : 0)) /
            Math.max(1, premium.softSkillPriorities.length + 1)) *
            100
        )
      : 0;
    const roadmap = premium
      ? Math.round((premium.roadmap.filter((r) => r.completed).length / Math.max(1, premium.roadmap.length)) * 100)
      : 0;
    return [
      { icon: UserRound, labelKey: "dsh.prog.cat.profile", value: dashboard?.profileCompletion ?? 0 },
      { icon: BookOpen, labelKey: "dsh.prog.cat.resources", value: resources },
      { icon: Sparkles, labelKey: "dsh.prog.cat.soft", value: softSkills },
      { icon: Compass, labelKey: "dsh.prog.cat.roadmap", value: roadmap },
    ];
  }, [latest, dashboard, store.completedSoftSkillActions, store.weeklyChallengeCompleted]);

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;
  if (fetching) return <PageLoader message={t("dsh.prog.loading")} />;

  if (error || !dashboard) {
    return (
      <div className="py-6">
        <ErrorState description={error ? t(error) : t("dsh.dataUnavailable")} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const overall = Math.round(categories.reduce((acc, c) => acc + c.value, 0) / categories.length);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </span>
            {t("dash.progress")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.prog.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-sm sm:flex-row dark:border-orange-900/60 dark:from-orange-950/50 dark:to-amber-950/30">
        <ScoreRing value={overall} size={96} />
        <div className="text-center sm:text-start">
          <h2 className="text-lg font-bold text-foreground">{t("dsh.prog.overall", { value: overall })}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dsh.prog.streakLabel")} <strong>{t("dsh.prog.streakDays", { count: dashboard.streak })}</strong> ·{" "}
            {t("dsh.prog.summaryRest", {
              resources: dashboard.completedResources,
              roadmap: dashboard.roadmapProgress,
            })}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="categories">
        <h2 id="categories" className="text-sm font-bold text-foreground">{t("dsh.prog.byCategory")}</h2>
        <ul className="mt-4 space-y-4">
          {categories.map((c) => (
            <li key={c.labelKey} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60">
                <c.icon className="h-4.5 w-4.5 text-orange-600 dark:text-orange-300" aria-hidden />
              </span>
              <ScoreBar value={c.value} label={t(c.labelKey)} className="flex-1" highlight={c.value >= 75} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="activity-chart">
        <h2 id="activity-chart" className="text-sm font-bold text-foreground">{t("dsh.prog.activity")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("dsh.prog.activityBody")}</p>
        <div className="mt-3">
          <TrendChart data={WEEKLY_ACTIVITY} label={t("dsh.prog.actions")} />
        </div>
      </section>
    </div>
  );
}
