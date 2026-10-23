/**
 * Rafi9i — Dashboard · Soft skills (Developer 2)
 * Priority skills, levels, completed activities, weekly challenge, trend.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Lock, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import SoftSkillCard from "@/components/results/SoftSkillCard";
import WeeklyChallengeCard from "@/components/resources/WeeklyChallengeCard";
import { CHART_THEME, localizeWeekLabel } from "@/components/progress/TrendChart";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useI18n } from "@/lib/i18n";
import { SOFT_SKILL_TREND } from "@/lib/mocks";
import type { LatestResult } from "@/lib/types";

export default function SoftSkillsPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
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

  if (loading || !session) return <PageLoader message={t("dsh.loading")} />;
  if (fetching) return <PageLoader message={t("dsh.soft.loading")} />;

  if (error) {
    return (
      <div className="py-6">
        <ErrorState description={t(error)} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const skills = latest?.result.softSkillPriorities ?? [];
  const isPremium = latest?.kind === "premium";
  const completedActions = store.completedSoftSkillActions.filter((id) =>
    skills.some((s) => s.id === id)
  );
  const trend = SOFT_SKILL_TREND.map((d) => ({ ...d, week: localizeWeekLabel(d.week, t) }));

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">
            <span className="rafi-icon-chip">
              <Sprout className="h-5 w-5" aria-hidden />
            </span>
            {t("dash.soft")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("dsh.soft.subtitle")}</p>
        </div>
        <DemoBadge />
      </header>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-6 text-center dark:border-orange-900/60 dark:bg-orange-950/30">
          <p className="text-sm font-semibold text-foreground">{t("dsh.soft.empty.title")}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{t("dsh.soft.empty.body")}</p>
          <Button asChild size="sm" className="mt-3 gap-1.5">
            <Link href="/assessment/basic">
              {t("dsh.soft.doAssessment")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <section aria-label={t("dsh.soft.priorities")} className="space-y-3">
            {skills.map((skill) => (
              <SoftSkillCard
                key={skill.id}
                skill={skill}
                completed={store.completedSoftSkillActions.includes(skill.id)}
                onToggleComplete={() => store.toggleSoftSkillAction(skill.id)}
              />
            ))}
            {!isPremium && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t("dsh.soft.lockedNote")}
              </p>
            )}
          </section>

          {isPremium && latest.result.softSkillPriorities[0] && (
            <WeeklyChallengeCard
              challenge={latest.result.softSkillPriorities[0]}
              completed={store.weeklyChallengeCompleted}
              onToggle={(done) => store.setWeeklyChallengeCompleted(done)}
            />
          )}

          {/* Completed activities */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="activities">
            <h2 id="activities" className="text-sm font-bold text-foreground">{t("dsh.soft.activities")}</h2>
            {completedActions.length === 0 && !store.weeklyChallengeCompleted ? (
              <p className="mt-2 text-sm text-muted-foreground">{t("dsh.soft.noActivities")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {store.weeklyChallengeCompleted && (
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>✓</span> {t("dsh.weekly.title")}
                  </li>
                )}
                {skills
                  .filter((s) => completedActions.includes(s.id))
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>✓</span>{" "}
                      {t("dsh.soft.practicalAction", { name: s.name })}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* Trend chart */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="trend">
            <h2 id="trend" className="text-sm font-bold text-foreground">{t("dsh.soft.trend")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("dsh.soft.trendBody")}</p>
            <div className="mt-3 h-52 w-full" role="img" aria-label={t("dsh.soft.trendAria")}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: CHART_THEME.tick }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_THEME.grid }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_THEME.tick }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={CHART_THEME.tooltip}
                    labelStyle={{ color: "var(--popover-foreground)" }}
                    formatter={(value: number) => [`${value}/100`, t("dsh.soft.avgLevel")]}
                  />
                  <Line type="monotone" dataKey="level" stroke="#f88541" strokeWidth={2.5} dot={{ r: 3, fill: "#f88541" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
