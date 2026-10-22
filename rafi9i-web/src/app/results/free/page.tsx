/**
 * Rafi9i — Free result page (Developer 2)
 * Useful by design: 3 fields, real scores, primary explanation,
 * 3 strengths, 1 soft skill, 1 next action + Premium Preview CTA.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, ClipboardList, Compass, Lightbulb, MapPin, Rocket, Sparkles, Sprout, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import { ScoreBar } from "@/components/shared/ScoreBar";
import FieldMatchCard from "@/components/results/FieldMatchCard";
import StrengthsBadges from "@/components/results/StrengthsBadges";
import PremiumUpsell from "@/components/results/PremiumUpsell";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { BASIC_QUESTIONS, optionLabel } from "@/lib/mocks";
import type { LatestResult, TrialStatus } from "@/lib/types";

export default function FreeResultPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();
  const store = useAssessmentStore();

  const [result, setResult] = useState<LatestResult | null>(null);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    Promise.all([api.results.latest(), api.trial.status()])
      .then(([latest, trialStatus]) => {
        setResult(latest);
        setTrial(trialStatus);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement du résultat impossible."))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  /* Already upgraded → send to the full result */
  useEffect(() => {
    if (result?.kind === "premium") router.replace("/results/premium");
  }, [result, router]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;

  if (fetching) return <PageLoader message="Rafi récupère ton résultat…" />;

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 py-10">
        <ErrorState
          title="Résultat indisponible"
          description={`${error} — ou passe en mode démo pour explorer l'interface avec des données de démonstration.`}
          onRetry={load}
          onDemoFallback={() => {
            setResult(demoBackend.getLatestResult());
            setTrial(demoBackend.getTrialStatus());
            setError("");
          }}
        />
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 py-10">
        <div className="mx-auto max-w-xl text-center">
          <FoxGuide
            stage="results"
            mood="thinking"
            message="Tu n'as pas encore de résultat : commence par l'évaluation d'orientation (10 minutes)."
          />
          <Button asChild className="mt-6 gap-2">
            <Link href="/assessment/basic">
              Faire mon évaluation <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { result: orientation } = result;
  const primary = orientation.topFields[0];
  const fallbackDemo = () => {
    const demo = demoBackend.getLatestResult();
    if (demo) setResult(demo);
  };

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBadge />
          {result.source === "fallback" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
              Rafi IA momentanément indisponible — résultat déterministe affiché
            </span>
          )}
        </div>

        <FoxGuide
          stage="results"
          mood="celebrating"
          progress={100}
          message={`Bravo ${session.user.name.split(" ")[0]} ! Ton résultat d'orientation est prêt. Voici tes premières pistes 🎉`}
        />

        {/* Profile summary */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="profile-summary">
          <h2 id="profile-summary" className="flex items-center gap-2 text-base font-bold text-stone-900">
            <UserRound className="h-5 w-5 text-orange-600" aria-hidden />
            Ton profil en bref
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{orientation.profileSummary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
              <MapPin className="mr-1 inline h-3.5 w-3.5" aria-hidden />{optionLabel(BASIC_QUESTIONS, "city", session.user.city ?? "") || "Ville non renseignée"}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
              <ClipboardList className="mr-1 inline h-3.5 w-3.5" aria-hidden />12 réponses analysées
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
              <CalendarDays className="mr-1 inline h-3.5 w-3.5" aria-hidden />Généré le {new Date(result.generatedAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </section>

        {/* Top 3 fields */}
        <section aria-labelledby="top-fields" className="space-y-3">
          <h2 id="top-fields" className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <Compass className="h-5 w-5 text-orange-600" aria-hidden />
            Tes 3 pistes possibles
          </h2>
          {orientation.topFields.map((field, index) => (
            <FieldMatchCard
              key={field.id}
              field={field}
              primary={index === 0}
              detailed={index === 0}
              saved={store.savedFields.includes(field.id)}
              onToggleSave={() => store.toggleSavedField(field.id)}
            />
          ))}
          <p className="text-xs text-stone-400">
            Les scores indiquent la compatibilité estimée entre ton profil et chaque domaine (0–100).
          </p>
        </section>

        {/* Strengths */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="strengths">
          <h2 id="strengths" className="text-base font-bold text-stone-900">
            <Sparkles className="mr-1.5 inline h-4 w-4 text-amber-500" aria-hidden />Trois forces qui te distinguent
          </h2>
          <div className="mt-3">
            <StrengthsBadges strengths={orientation.strengths} />
          </div>
        </section>

        {/* Soft skill to improve */}
        {orientation.softSkillPriorities[0] && (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="soft-skill">
            <h2 id="soft-skill" className="text-base font-bold text-stone-900">
              <Sprout className="mr-1.5 inline h-4 w-4 text-teal-600" aria-hidden />Ta première soft skill à travailler
            </h2>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">{orientation.softSkillPriorities[0].name}</h3>
                <span className="text-xs font-bold text-orange-700">Niveau {orientation.softSkillPriorities[0].currentLevel}/100</span>
              </div>
              <ScoreBar value={orientation.softSkillPriorities[0].currentLevel} className="mt-1.5" />
              <p className="mt-2 text-sm text-stone-600">{orientation.softSkillPriorities[0].reason}</p>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                <p className="text-xs leading-relaxed text-stone-700">
                  <span className="font-semibold">Action de la semaine : </span>
                  {orientation.softSkillPriorities[0].action}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-400">
              🔒 L&apos;analyse complète des 3 soft skills prioritaires est incluse dans l&apos;Aperçu Premium.
            </p>
          </section>
        )}

        {/* Next action */}
        <section className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
          <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" aria-hidden />
          <div>
            <h2 className="text-base font-bold text-stone-900">Ta prochaine action recommandée</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{primary?.nextAction}</p>
          </div>
        </section>

        {/* Premium CTA */}
        <PremiumUpsell />

        <div className="pb-6 text-center">
          <Button asChild variant="ghost" className="text-stone-500">
            <Link href="/dashboard">Aller au tableau de bord <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
