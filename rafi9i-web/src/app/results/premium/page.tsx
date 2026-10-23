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
import { useI18n } from "@/lib/i18n";

/** Sentinel for failures without a server message; rendered as a translated fallback. */
const LOAD_FAILED = "__load_failed__";
/** Sentinel for "no demo result available"; rendered as a translated message. */
const NO_DEMO = "__no_demo__";

export default function PremiumResultPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const store = useAssessmentStore();
  const { t } = useI18n();

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
      .catch((e: unknown) => setError(e instanceof Error ? e.message : LOAD_FAILED))
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

  if (loading || !session) return <PageLoader message={t("asm.loadingSpace")} />;
  if (fetching) return <PageLoader message={t("asm.prem.preparing")} />;

  if (error || !result || result.kind !== "premium") {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-10">
        <ErrorState
          title={t("asm.prem.unavailable")}
          description={
            error === LOAD_FAILED
              ? t("asm.loadError")
              : error === NO_DEMO
                ? t("asm.prem.noDemo")
                : error || t("asm.prem.notReady")
          }
          onRetry={load}
          onDemoFallback={() => {
            const demo = demoBackend.getLatestResult();
            if (demo) setResult(demo);
            else setError(NO_DEMO);
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
    <main className="min-h-screen bg-orange-50/40 px-4 dark:bg-background py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBadge />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-bold text-white">
            <Crown className="h-3 w-3" aria-hidden />
            {t("asm.prem.badge")}
          </span>
        </div>

        {result.source === "fallback" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300" role="note">
            {t("asm.fallbackNoticeSafe")}
          </div>
        )}

        <FoxGuide
          stage="results"
          mood="celebrating"
          progress={100}
          message={t("asm.prem.congrats", { name: session.user.name.split(" ")[0] })}
        />

        {/* Profile summary + primary score */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {primary && <ScoreRing value={primary.score} size={84} />}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-foreground sm:text-xl">
                {primary ? primary.name : t("asm.prem.yourOrientation")}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{orientation.profileSummary}</p>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("asm.prem.strengths")}</h2>
            <div className="mt-2">
              <StrengthsBadges strengths={orientation.strengths} />
            </div>
          </div>
        </section>

        {/* ------------------------- 4 sections ------------------------- */}
        <Tabs defaultValue="orientation" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4" aria-label={t("asm.prem.tabsLabel")}>
            <TabsTrigger value="orientation" className="gap-1.5"><Compass className="h-4 w-4" aria-hidden />{t("asm.prem.tab.orientation")}</TabsTrigger>
            <TabsTrigger value="soft-skills" className="gap-1.5"><Sprout className="h-4 w-4" aria-hidden />{t("asm.prem.tab.softSkills")}</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5"><BookOpen className="h-4 w-4" aria-hidden />{t("asm.prem.tab.resources")}</TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-1.5"><Map className="h-4 w-4" aria-hidden />{t("asm.prem.tab.roadmap")}</TabsTrigger>
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
                <h2 className="mb-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-4 w-4" aria-hidden />
                  {t("asm.prem.alternatives")}
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
            <p className="text-sm text-muted-foreground">
              {t("asm.prem.softIntro")}
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
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{t("asm.prem.resourcesTitle")}</h2>
              <span className="text-xs font-semibold text-muted-foreground">
                {t("asm.prem.resourcesDone", { done: resourcesDone, total: orientation.resources.length })}
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
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden />
                  {t("asm.prem.roadmapProgress")}
                </h2>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{Math.round((roadmapDone / Math.max(1, orientation.roadmap.length)) * 100)}%</span>
              </div>
              <Progress value={(roadmapDone / Math.max(1, orientation.roadmap.length)) * 100} className="mt-2.5" />
              <p className="mt-2 text-xs text-muted-foreground">
                {t(roadmapDone > 1 ? "asm.prem.milestones.other" : "asm.prem.milestones.one", {
                  done: roadmapDone,
                  total: orientation.roadmap.length,
                })}
              </p>
            </div>
            <RoadmapTasks steps={orientation.roadmap} onToggle={toggleRoadmap} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-2 pb-8 sm:flex-row">
          <Button asChild className="flex-1 gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              {t("asm.prem.openDashboard")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/roadmap">
              {t("asm.prem.followRoadmap")} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
