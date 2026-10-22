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
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    api.dashboard
      .get()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement du tableau de bord impossible."))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (loading || !session) return <PageLoader message="Ouverture de ton tableau de bord…" />;
  if (fetching) return <PageLoader message="Rafi rassemble tes progrès…" />;

  if (error || !data) {
    return (
      <div className="py-6">
        <ErrorState
          title="Tableau de bord indisponible"
          description={error || "Aucune donnée reçue."}
          onRetry={load}
          onDemoFallback={() => {
            setData(demoFallbackDashboard());
            setError("");
          }}
        />
      </div>
    );
  }

  const limited = dashboardIsLimited(data.trial);
  const challenge = data.weeklyChallenge;
  const firstName = session.user.name.split(" ")[0];
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="space-y-6 pb-10">
      {/* Greeting */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium capitalize text-stone-500">{today}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-stone-900">Bonjour {firstName} 👋</h1>
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
      <section aria-label="Tes statistiques" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-orange-600" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Profil</p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <ScoreRing value={data.profileCompletion} size={52} />
            <p className="text-xs leading-snug text-stone-500">complété</p>
          </div>
        </div>
        <StatCard icon={Flame} label="Série" value={`${data.streak} j`} hint="jours d'activité" accent />
        <StatCard icon={BookOpen} label="Ressources" value={`${data.completedResources}`} hint="terminées" />
        <StatCard icon={Map} label="Parcours" value={`${data.roadmapProgress}%`} hint="4 étapes" />
      </section>

      {/* Orientation stage + primary field */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <Compass className="h-4 w-4 text-orange-600" aria-hidden />
              Étape d&apos;orientation
            </h2>
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-orange-700">
              <Link href="/dashboard/orientation">
                Détails <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-2 text-sm text-stone-600">{data.orientationStage}</p>
          <Progress
            value={
              data.primaryField ? 70 : 20
            }
            className="mt-3"
            aria-label="Progression de l'orientation"
          />
        </div>

        {data.primaryField ? (
          <FieldMatchCard field={data.primaryField} primary={false} />
        ) : (
          <div className="flex flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-5">
            <p className="text-sm font-semibold text-stone-800">Ton orientation n&apos;est pas encore calculée</p>
            <p className="text-xs leading-relaxed text-stone-600">
              Termine l&apos;évaluation de base (10 minutes) pour découvrir tes premières pistes.
            </p>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/assessment/basic">
                Commencer <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
      <section className="flex items-start gap-3 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-orange-700">Prochaine action recommandée</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-800">{data.nextAction}</p>
        </div>
      </section>

      {/* Plan upsell / premium status */}
      {limited ? (
        <PremiumUpsell />
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-300 bg-white p-5 shadow-sm">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-stone-900"><Crown className="h-4 w-4 text-orange-600" aria-hidden />Accès Premium actif</h2>
            <p className="mt-0.5 text-xs text-stone-600">
              Évaluations avancées, résultats détaillés et parcours complets débloqués.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/results/premium">
              Voir mon résultat Premium <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

/* Fallback minimal si le dashboard est totalement indisponible. */
function demoFallbackDashboard(): DashboardData {
  return {
    profileCompletion: 25,
    trial: { status: "not_started", startedAt: null, expiresAt: null, daysRemaining: 0, accessLevel: "free" },
    orientationStage: "Découverte — évaluation de base à faire",
    primaryField: null,
    weeklyChallenge: null,
    roadmapProgress: 0,
    completedResources: 0,
    streak: 0,
    nextAction: "Termine l'évaluation d'orientation pour débloquer ton tableau de bord.",
  };
}
