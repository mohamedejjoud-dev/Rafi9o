/**
 * Rafi9i — Dashboard · Roadmap (Developer 2)
 * Four stages, individual tasks, completed/upcoming milestones, updates
 * completion through PATCH /progress/roadmap/{id}.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import RoadmapTasks from "@/components/dashboard/RoadmapTasks";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import type { LatestResult, RoadmapStep } from "@/lib/types";

export default function RoadmapPage() {
  const { session, loading } = useRequireAuth();
  const { t } = useI18n();
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    api.results
      .latest()
      .then(setLatest)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "dsh.loadError"))
      .finally(() => setFetching(false));
  }, [session]);

  const toggle = useCallback((id: string, completed: boolean) => {
    setLatest((prev) =>
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

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;
  if (fetching) return <PageLoader message={t("dsh.road.loading")} />;

  if (error) {
    return (
      <div className="py-6">
        <ErrorState description={t(error)} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const steps: RoadmapStep[] = latest?.kind === "premium" ? latest.result.roadmap : [];
  const done = steps.filter((s) => s.completed);
  const upcoming = steps.filter((s) => !s.completed);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <Map className="h-5 w-5" aria-hidden />
            </span>
            {t("dsh.road.title")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.road.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      {steps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-6 text-center dark:border-orange-900/60 dark:bg-orange-950/30">
          <p className="text-sm font-semibold text-foreground">{t("dsh.road.empty.title")}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{t("dsh.road.empty.body")}</p>
          <Button asChild size="sm" className="mt-3 gap-1.5">
            <Link href="/trial">
              {t("dsh.road.unlockPremium")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Overall progress */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">{t("dsh.road.overall")}</h2>
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                {Math.round((done.length / Math.max(1, steps.length)) * 100)}%
              </span>
            </div>
            <Progress value={(done.length / Math.max(1, steps.length)) * 100} className="mt-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("dsh.road.milestonesText", { done: done.length, total: steps.length })}
            </p>
          </div>

          {/* Tasks by stage */}
          <RoadmapTasks steps={steps} onToggle={toggle} />

          {/* Milestones */}
          <section className="grid gap-4 sm:grid-cols-2" aria-label={t("dsh.road.milestones")}>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                {t("dsh.road.reached", { count: done.length })}
              </h2>
              {done.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">{t("dsh.road.noneReached")}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {done.map((s) => (
                    <li key={s.id} className="text-xs text-foreground">✓ {s.title}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CircleDashed className="h-4 w-4 text-muted-foreground" aria-hidden />
                {t("dsh.road.upcoming", { count: upcoming.length })}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {upcoming.slice(0, 4).map((s) => (
                  <li key={s.id} className="text-xs text-foreground">• {s.title}</li>
                ))}
                {upcoming.length > 4 && (
                  <li className="text-xs text-muted-foreground">{t("dsh.road.more", { count: upcoming.length - 4 })}</li>
                )}
                {upcoming.length === 0 && (
                  <li className="text-xs text-emerald-700 dark:text-emerald-400">{t("dsh.road.finished")}</li>
                )}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
