/**
 * Rafi9i — Advanced assessment (10 deep questions) (Developer 2)
 * Premium Preview gated: requires an active trial or Premium plan.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Eye, Lock, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { isPremiumAccess } from "@/lib/access";
import { useAssessmentStore } from "@/lib/assessment-store";
import { advancedSchema, type AssessmentOverview, type TrialStatus } from "@/lib/types";

export default function AdvancedAssessmentPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();

  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [overview, setOverview] = useState<AssessmentOverview | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.trial.status(), api.assessments.startAdvanced()])
      .then(([t, o]) => {
        setTrial(t);
        setOverview(o);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setChecking(false));
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;

  if (checking) return <PageLoader message="Vérification de ton accès Premium…" />;

  /* Access gate: Premium Preview required for the advanced assessment */
  if (trial && !isPremiumAccess(trial)) {
    return (
      <main className="min-h-screen bg-orange-50/40 px-4 py-10">
        <div className="mx-auto max-w-xl text-center">
          <FoxGuide
            stage="trial"
            mood="encouraging"
            compact
            message="L'évaluation approfondie fait partie de l'Aperçu Premium. Active tes 3 jours gratuits pour continuer !"
          />
          <h1 className="mt-5 flex items-center justify-center gap-2 text-xl font-bold text-stone-900">Contenu Aperçu Premium<Lock className="h-5 w-5 text-orange-600" aria-hidden /></h1>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild className="gap-2">
              <Link href="/trial">
                <Crown className="h-4 w-4" aria-hidden />
                Activer mon aperçu gratuit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/results/free">Revoir mon résultat gratuit</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex justify-end">
          <DemoBadge />
        </div>

        {!overview && !error && <PageLoader message="Préparation de ton évaluation approfondie…" />}

        {!overview && error && (
          <ErrorState
            title="Évaluation approfondie indisponible"
            description={error}
            onRetry={() => {
              setChecking(true);
              setError("");
              api.assessments
                .startAdvanced()
                .then(setOverview)
                .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
                .finally(() => setChecking(false));
            }}
            onDemoFallback={() => {
              setOverview(demoBackend.startAdvanced());
              setError("");
            }}
          />
        )}

        {overview && overview.completed && (
          <div className="mx-auto max-w-2xl">
            <FoxGuide
              stage="assessment"
              mood="celebrating"
              message="Évaluation approfondie déjà terminée — ton résultat Premium t'attend !"
            />
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1 gap-2">
                <Link href="/results/premium">
                  <Eye className="h-4 w-4" aria-hidden />
                  Voir mon résultat Premium
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setOverview({ ...overview, completed: false })}>
                <RefreshCcw className="h-4 w-4" aria-hidden />
                Refaire l&apos;évaluation
              </Button>
            </div>
          </div>
        )}

        {overview && !overview.completed && (
          <AssessmentFlow
            variant="advanced"
            title="Évaluation approfondie Premium"
            introMessage="Dix questions plus personnelles : environnement de travail, mobilité, obstacles… Rafi en tiendra compte dans ton analyse finale."
            loadingMessage="Ton résultat Premium se prépare avec l'analyse complète."
            questions={overview.questions}
            schema={advancedSchema}
            submit={(answers) => api.assessments.submitAdvanced(answers)}
            demoSubmit={(answers) => demoBackend.submitAdvanced(answers)}
            successRoute="/results/premium"
            onSubmitted={() => useAssessmentStore.getState().resetAdvanced()}
          />
        )}
      </div>
    </main>
  );
}
