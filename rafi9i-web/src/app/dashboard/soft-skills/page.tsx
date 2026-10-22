/**
 * Rafi9i — Dashboard · Soft skills (Developer 2)
 * Priority skills, levels, completed activities, weekly challenge, trend.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import SoftSkillCard from "@/components/results/SoftSkillCard";
import WeeklyChallengeCard from "@/components/resources/WeeklyChallengeCard";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { SOFT_SKILL_TREND } from "@/lib/mocks";
import type { LatestResult } from "@/lib/types";

export default function SoftSkillsPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    api.results
      .latest()
      .then(setLatest)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setFetching(false));
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement…" />;
  if (fetching) return <PageLoader message="Chargement de tes soft skills…" />;

  if (error) {
    return (
      <div className="py-6">
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const skills = latest?.result.softSkillPriorities ?? [];
  const isPremium = latest?.kind === "premium";
  const completedActions = store.completedSoftSkillActions.filter((id) =>
    skills.some((s) => s.id === id)
  );

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <span className="rafi-icon-chip">
              <Sprout className="h-5 w-5" aria-hidden />
            </span>
            Soft skills
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Tes priorités et tes progrès hebdomadaires.</p>
        </div>
        <DemoBadge />
      </header>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-6 text-center">
          <p className="text-sm font-semibold text-stone-800">Aucune priorité calculée pour l&apos;instant</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-600">
            Termine l&apos;évaluation de base pour obtenir ta première soft skill à travailler — puis l&apos;évaluation
            Premium pour les trois priorités complètes.
          </p>
          <Button asChild size="sm" className="mt-3 gap-1.5">
            <Link href="/assessment/basic">
              Faire mon évaluation <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <section aria-label="Compétences prioritaires" className="space-y-3">
            {skills.map((skill) => (
              <SoftSkillCard
                key={skill.id}
                skill={skill}
                completed={store.completedSoftSkillActions.includes(skill.id)}
                onToggleComplete={() => store.toggleSoftSkillAction(skill.id)}
              />
            ))}
            {!isPremium && (
              <p className="text-xs text-stone-400">
                🔒 Les deux autres priorités soft skills sont incluses dans l&apos;Aperçu Premium.
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
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="activities">
            <h2 id="activities" className="text-sm font-bold text-stone-900">Activités réalisées</h2>
            {completedActions.length === 0 && !store.weeklyChallengeCompleted ? (
              <p className="mt-2 text-sm text-stone-500">
                Aucune activité terminée pour le moment — commence par le défi de la semaine !
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {store.weeklyChallengeCompleted && (
                  <li className="flex items-center gap-2 text-sm text-stone-700">
                    <span className="text-emerald-600" aria-hidden>✓</span> Défi soft skills de la semaine
                  </li>
                )}
                {skills
                  .filter((s) => completedActions.includes(s.id))
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-sm text-stone-700">
                      <span className="text-emerald-600" aria-hidden>✓</span> Action pratique — {s.name}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* Trend chart */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="trend">
            <h2 id="trend" className="text-sm font-bold text-stone-900">Tendance de progression</h2>
            <p className="mt-1 text-xs text-stone-500">Niveau moyen de tes soft skills sur les 8 dernières semaines (données de démonstration).</p>
            <div className="mt-3 h-52 w-full" role="img" aria-label="Courbe de progression des soft skills sur 8 semaines">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SOFT_SKILL_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={{ stroke: "#E7E5E4" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #FED7AA", fontSize: 12 }}
                    formatter={(value: number) => [`${value}/100`, "Niveau moyen"]}
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
