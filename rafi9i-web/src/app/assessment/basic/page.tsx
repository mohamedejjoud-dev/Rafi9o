/**
 * Rafi9i — Basic assessment (12 questions) (Developer 2)
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import FoxGuide from "@/components/fox/FoxGuide";
import { api, demoBackend } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { useAssessmentStore } from "@/lib/assessment-store";
import { basicSchema, type AssessmentOverview } from "@/lib/types";

export default function BasicAssessmentPage() {
  const { session, loading } = useRequireAuth();
  const [overview, setOverview] = useState<AssessmentOverview | null>(null);
  const [error, setError] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  const load = () => {
    setFetching(true);
    setError("");
    api.assessments
      .startBasic()
      .then(setOverview)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;

  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {fetching && <PageLoader message="Préparation de ton évaluation…" />}

        {!fetching && error && (
          <ErrorState
            title="Évaluation indisponible"
            description={error}
            onRetry={load}
            onDemoFallback={() => {
              setOverview(demoBackend.startBasic());
              setError("");
            }}
          />
        )}

        {!fetching && !error && overview && overview.completed && (
          <div className="mx-auto max-w-2xl">
            <FoxGuide
              stage="assessment"
              mood="celebrating"
              message="Tu as déjà terminé cette évaluation, bravo ! Tu peux consulter ton résultat ou la refaire."
            />
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1 gap-2">
                <Link href="/results/free">
                  <Eye className="h-4 w-4" aria-hidden />
                  Voir mon résultat gratuit
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setOverview({ ...overview, completed: false })}>
                <RefreshCcw className="h-4 w-4" aria-hidden />
                Refaire l&apos;évaluation
              </Button>
            </div>
          </div>
        )}

        {!fetching && !error && overview && !overview.completed && (
          <AssessmentFlow
            variant="basic"
            title="Ton évaluation d'orientation"
            introMessage="C'est parti pour ta première évaluation ! Douze questions pour comprendre qui tu es académiquement."
            loadingMessage="Cela prend généralement moins de 20 secondes."
            questions={overview.questions}
            schema={basicSchema}
            submit={(answers) => api.assessments.submitBasic(answers)}
            demoSubmit={(answers) => demoBackend.submitBasic(answers)}
            successRoute="/results/free"
            onSubmitted={() => useAssessmentStore.getState().resetBasic()}
          />
        )}
      </div>
    </main>
  );
}
