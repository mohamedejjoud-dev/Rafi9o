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
import TrendChart from "@/components/progress/TrendChart";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { WEEKLY_ACTIVITY } from "@/lib/mocks";
import type { DashboardData, LatestResult } from "@/lib/types";

export default function ProgressPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
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
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
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
      { icon: UserRound, label: "Profil & évaluations", value: dashboard?.profileCompletion ?? 0 },
      { icon: BookOpen, label: "Ressources terminées", value: resources },
      { icon: Sparkles, label: "Activités soft skills", value: softSkills },
      { icon: Compass, label: "Parcours (roadmap)", value: roadmap },
    ];
  }, [latest, dashboard, store.completedSoftSkillActions, store.weeklyChallengeCompleted]);

  if (loading || !session) return <PageLoader message="Chargement…" />;
  if (fetching) return <PageLoader message="Calcul de ta progression…" />;

  if (error || !dashboard) {
    return (
      <div className="py-6">
        <ErrorState description={error || "Données indisponibles."} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const overall = Math.round(categories.reduce((acc, c) => acc + c.value, 0) / categories.length);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <span className="rafi-icon-chip">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </span>
            Progression
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Vue d&apos;ensemble de ton engagement.</p>
        </div>
        <DemoBadge />
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-sm sm:flex-row">
        <ScoreRing value={overall} size={96} />
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold text-stone-900">Progression globale : {overall}%</h2>
          <p className="mt-1 text-sm text-stone-600">
            Série en cours : <strong>{dashboard.streak} jours</strong> · {dashboard.completedResources} ressource(s)
            terminée(s) · parcours à {dashboard.roadmapProgress}%.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="categories">
        <h2 id="categories" className="text-sm font-bold text-stone-900">Détail par catégorie</h2>
        <ul className="mt-4 space-y-4">
          {categories.map((c) => (
            <li key={c.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <c.icon className="h-4.5 w-4.5 text-orange-600" aria-hidden />
              </span>
              <ScoreBar value={c.value} label={c.label} className="flex-1" highlight={c.value >= 75} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="activity-chart">
        <h2 id="activity-chart" className="text-sm font-bold text-stone-900">Activité des 8 dernières semaines</h2>
        <p className="mt-1 text-xs text-stone-500">Actions réalisées par semaine (données de démonstration).</p>
        <div className="mt-3">
          <TrendChart data={WEEKLY_ACTIVITY} label="actions" />
        </div>
      </section>
    </div>
  );
}
