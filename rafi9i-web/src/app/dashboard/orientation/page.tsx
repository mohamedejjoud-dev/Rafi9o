/**
 * Rafi9i — Dashboard · Orientation (Developer 2)
 * Assessment status, top field matches, fields explored, saved selections.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, CheckCircle2, CircleDashed, Compass, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar } from "@/components/shared/ScoreBar";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { formatDate, isPremiumAccess } from "@/lib/access";
import { useAssessmentStore } from "@/lib/assessment-store";
import { FIELDS_CATALOG } from "@/lib/mocks";
import type { LatestResult, TrialStatus } from "@/lib/types";

export default function OrientationPage() {
  const { session, loading } = useRequireAuth();
  const store = useAssessmentStore();
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.results.latest(), api.trial.status()])
      .then(([r, t]) => {
        setLatest(r);
        setTrial(t);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setFetching(false));
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement…" />;
  if (fetching) return <PageLoader message="Chargement de ton orientation…" />;

  if (error) {
    return (
      <div className="py-6">
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const basicDone = latest !== null;
  const premiumDone = latest?.kind === "premium";
  const topFields = latest?.result.topFields ?? [];
  const exploredIds = new Set(topFields.map((f) => f.id));

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <span className="rafi-icon-chip">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            Orientation
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Ton avancement et tes pistes actuelles.</p>
        </div>
        <DemoBadge />
      </header>

      {/* Assessment status */}
      <section aria-labelledby="status-title" className="grid gap-3 sm:grid-cols-2">
        <h2 id="status-title" className="sr-only">Statut des évaluations</h2>
        <div className={`rounded-2xl border p-5 ${basicDone ? "border-emerald-200 bg-emerald-50/40" : "border-stone-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            {basicDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> : <CircleDashed className="h-5 w-5 text-stone-400" aria-hidden />}
            <h3 className="text-sm font-bold text-stone-900">Évaluation de base</h3>
            <span className="ml-auto text-[11px] font-semibold text-stone-500">Gratuit</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            {basicDone ? `Terminée le ${formatDate(latest.generatedAt)}` : "Pas encore terminée — 12 questions, ~6 minutes."}
          </p>
          <Button asChild size="sm" variant={basicDone ? "outline" : "default"} className={`mt-3 ${basicDone ? "" : ""}`}>
            <Link href={basicDone ? "/results/free" : "/assessment/basic"}>
              {basicDone ? "Revoir mon résultat" : "Commencer"} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className={`rounded-2xl border p-5 ${premiumDone ? "border-emerald-200 bg-emerald-50/40" : trial && isPremiumAccess(trial) ? "border-orange-300 bg-orange-50/50" : "border-stone-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            {premiumDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> : <Crown className="h-5 w-5 text-orange-600" aria-hidden />}
            <h3 className="text-sm font-bold text-stone-900">Évaluation approfondie</h3>
            <span className="ml-auto text-[11px] font-semibold text-orange-700">Premium</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            {premiumDone
              ? `Terminée le ${formatDate(latest.generatedAt)}`
              : trial && isPremiumAccess(trial)
                ? "Incluse dans ton aperçu — 10 questions complémentaires."
                : "Nécessite l'Aperçu Premium (3 jours gratuits)."}
          </p>
          <Button asChild size="sm" variant={premiumDone ? "outline" : "default"} className={`mt-3 ${premiumDone || (trial && isPremiumAccess(trial)) ? "" : ""}`}>
            <Link href={premiumDone ? "/results/premium" : trial && isPremiumAccess(trial) ? "/assessment/advanced" : "/trial"}>
              {premiumDone ? "Voir mon résultat Premium" : trial && isPremiumAccess(trial) ? "Passer l'évaluation" : "Débloquer"} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Top matches */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="top-matches">
        <h2 id="top-matches" className="text-sm font-bold text-stone-900">Tes meilleures correspondances</h2>
        {topFields.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Aucun résultat pour l&apos;instant — termine l&apos;évaluation de base pour voir tes correspondances.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {topFields.map((f) => (
              <li key={f.id}>
                <ScoreBar value={f.score} label={f.name} highlight={f.id === topFields[0].id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fields explored */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="explored">
        <h2 id="explored" className="text-sm font-bold text-stone-900">Domaines explorés</h2>
        <p className="mt-1 text-xs text-stone-500">Les 5 domaines analysés par Rafi pour ton profil.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FIELDS_CATALOG.map((f) => (
            <li
              key={f.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                exploredIds.has(f.id)
                  ? "border-orange-300 bg-orange-50 text-orange-800"
                  : "border-stone-200 bg-stone-50 text-stone-500"
              }`}
            >
              {exploredIds.has(f.id) && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
              {f.name}
              {exploredIds.has(f.id) && <span className="text-[10px] font-bold uppercase">exploré</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Saved selections */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="saved-selections">
        <div className="flex items-center justify-between">
          <h2 id="saved-selections" className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Bookmark className="h-4 w-4 text-orange-600" aria-hidden />
            Sélections enregistrées
          </h2>
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-orange-700">
            <Link href="/dashboard/saved">
              Tout voir <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </Button>
        </div>
        {store.savedFields.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            Tu n&apos;as pas encore enregistré de domaine — utilise le marque-page sur tes pistes préférées.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {topFields
              .filter((f) => store.savedFields.includes(f.id))
              .map((f) => (
                <FieldMatchCard
                  key={f.id}
                  field={f}
                  saved
                  onToggleSave={() => store.toggleSavedField(f.id)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
