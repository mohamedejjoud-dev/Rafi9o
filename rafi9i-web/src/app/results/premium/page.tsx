/**
 * Rafi9i — Premium result: 4 detailed sections (Developer 2)
 * 1. Orientation  2. Soft skills  3. Learning resources  4. Career roadmap
 * Gated by an active Premium Preview / Premium plan.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Compass, Crown, LayoutDashboard, Map, Sprout, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar, ScoreRing } from "@/components/shared/ScoreBar";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import SoftSkillCard from "@/components/results/SoftSkillCard";
import StrengthsBadges from "@/components/results/StrengthsBadges";
import ResourceList from "@/components/resources/ResourceList";
import WeeklyChallengeCard from "@/components/resources/WeeklyChallengeCard";
import RoadmapTasks from "@/components/dashboard/RoadmapTasks";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { canViewPremiumResult } from "@/lib/access";
import { useAssessmentStore } from "@/lib/assessment-store";
import type { LatestResult, TrialStatus } from "@/lib/types";

export default function PremiumResultPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const store = useAssessmentStore();

  const [result, setResult] = useState<LatestResult | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    Promise.all([api.results.latest(), api.trial.status()])
      .then(([r, t]) => {
        setResult(r);
        setTrial(t);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const toggleResource = useCallback(
    (id: string, completed: boolean) => {
      // Optimistic update, then persist (mock fallback automatic).
      setResult((prev) =>
        prev
          ? {
              ...prev,
              result: {
                ...prev.result,
                resources: prev.result.resources.map((r) => (r.id === id ? { ...r, completed } : r)),
              },
            }
          : prev
      );
      api.progress.resource(id, completed).catch(() => undefined);
    },
    []
  );

  const toggleRoadmap = useCallback((id: string, completed: boolean) => {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            result: {
              ...prev.result,
              roadmap: prev.result.roadmap.map((r) => (r.id === id ? { ...r, completed } : r)),
            },
          }
        : prev
    );
    api.progress.roadmap(id, completed).catch(() => undefined);
  }, []);

  /* Access gates */
  useEffect(() => {
    if (fetching || !trial) return;
    if (!canViewPremiumResult(trial)) router.replace("/trial");
  }, [trial, fetching, router]);

  useEffect(() => {
    if (fetching || !result || !trial) return;
    if (!canViewPremiumResult(trial)) return;
    if (!result) {
      router.replace("/assessment/basic");
    } else if (result.kind === "free") {
      router.replace("/assessment/advanced");
    }
  }, [result, trial, fetching, router]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;
  if (fetching) return <PageLoader message="Rafi prépare ton analyse Premium…" />;

  if (error || !result || result.kind !== "premium") {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 py-10">
        <ErrorState
          title="Résultat Premium indisponible"
          description={
            error ||
            "Ton résultat détaillé n'est pas encore prêt : termine l'évaluation approfondie pour le générer."
          }
          onRetry={load}
          onDemoFallback={() => {
            const demo = demoBackend.getLatestResult();
            if (demo) setResult(demo);
            else setError("Aucun résultat de démonstration disponible — termine d'abord une évaluation.");
          }}
        />
      </main>
    );
  }

  const { result: orientation } = result;
  const [primary, ...alternatives] = orientation.topFields;
  const roadmapDone = orientation.roadmap.filter((r) => r.completed).length;
  const resourcesDone = orientation.resources.filter((r) => r.completed).length;

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBadge />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-bold text-white">
            <Crown className="h-3 w-3" aria-hidden />
            Résultat Premium
          </span>
        </div>

        {result.source === "fallback" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800" role="note">
            Rafi IA momentanément indisponible — résultat déterministe affiché (aucune donnée perdue).
          </div>
        )}

        <FoxGuide
          stage="results"
          mood="celebrating"
          progress={100}
          message={`Analyse complète terminée, ${session.user.name.split(" ")[0]} ! Voici tes quatre sections Premium`}
        />

        {/* Profile summary + primary score */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {primary && <ScoreRing value={primary.score} size={84} />}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-stone-900 sm:text-xl">
                {primary ? primary.name : "Ton orientation"}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{orientation.profileSummary}</p>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Tes forces</h2>
            <div className="mt-2">
              <StrengthsBadges strengths={orientation.strengths} />
            </div>
          </div>
        </section>

        {/* ------------------------- 4 sections ------------------------- */}
        <Tabs defaultValue="orientation" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4" aria-label="Sections du résultat Premium">
            <TabsTrigger value="orientation" className="gap-1.5"><Compass className="h-4 w-4" aria-hidden />Orientation</TabsTrigger>
            <TabsTrigger value="soft-skills" className="gap-1.5"><Sprout className="h-4 w-4" aria-hidden />Soft skills</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5"><BookOpen className="h-4 w-4" aria-hidden />Ressources</TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-1.5"><Map className="h-4 w-4" aria-hidden />Parcours</TabsTrigger>
          </TabsList>

          {/* 1 — Orientation */}
          <TabsContent value="orientation" className="mt-4 space-y-4">
            {primary && (
              <FieldMatchCard
                field={primary}
                primary
                detailed
                saved={store.savedFields.includes(primary.id)}
                onToggleSave={() => store.toggleSavedField(primary.id)}
              />
            )}
            {alternatives.length > 0 && (
              <div>
                <h2 className="mb-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-stone-500">
                  <Target className="h-4 w-4" aria-hidden />
                  Deux alternatives crédibles
                </h2>
                <div className="space-y-3">
                  {alternatives.map((field) => (
                    <FieldMatchCard
                      key={field.id}
                      field={field}
                      saved={store.savedFields.includes(field.id)}
                      onToggleSave={() => store.toggleSavedField(field.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* 2 — Soft skills */}
          <TabsContent value="soft-skills" className="mt-4 space-y-4">
            <p className="text-sm text-stone-600">
              Tes trois priorités, estimées à partir de tes 22 réponses. Une action pratique par compétence : 
              petite, concrète, faisable cette semaine.
            </p>
            {orientation.softSkillPriorities.map((skill, i) => (
              <SoftSkillCard
                key={skill.id}
                skill={skill}
                completed={store.completedSoftSkillActions.includes(skill.id)}
                onToggleComplete={() => store.toggleSoftSkillAction(skill.id)}
              />
            ))}
          </TabsContent>

          {/* 3 — Resources */}
          <TabsContent value="resources" className="mt-4 space-y-4">
            {orientation.softSkillPriorities[0] && (
              <WeeklyChallengeCard
                challenge={orientation.softSkillPriorities[0]}
                completed={store.weeklyChallengeCompleted}
                onToggle={(done) => store.setWeeklyChallengeCompleted(done)}
              />
            )}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">Ressources recommandées</h2>
              <span className="text-xs font-semibold text-stone-500">
                {resourcesDone}/{orientation.resources.length} terminées
              </span>
            </div>
            <ResourceList
              resources={orientation.resources}
              savedIds={store.savedResources}
              onToggleCompleted={toggleResource}
              onToggleSaved={store.toggleSavedResource}
            />
          </TabsContent>

          {/* 4 — Roadmap */}
          <TabsContent value="roadmap" className="mt-4 space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <TrendingUp className="h-4 w-4 text-orange-600" aria-hidden />
                  Progression du parcours
                </h2>
                <span className="text-sm font-bold text-orange-700">{Math.round((roadmapDone / Math.max(1, orientation.roadmap.length)) * 100)}%</span>
              </div>
              <Progress value={(roadmapDone / Math.max(1, orientation.roadmap.length)) * 100} className="mt-2.5" />
              <p className="mt-2 text-xs text-stone-500">
                {roadmapDone} jalon{roadmapDone > 1 ? "s" : ""} sur {orientation.roadmap.length} atteint
                {roadmapDone > 1 ? "s" : ""} · cochez chaque tâche terminée pour faire avancer ton plan.
              </p>
            </div>
            <RoadmapTasks steps={orientation.roadmap} onToggle={toggleRoadmap} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-2 pb-8 sm:flex-row">
          <Button asChild className="flex-1 gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Ouvrir mon tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/roadmap">
              Suivre mon parcours <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
