/**
 * Rafi9i — Premium Preview: 3-day trial experience (Developer 2)
 * States: activation → confirmation → active (countdown) → expired →
 * subscribed marker + free-plan fallback + locked premium cards.
 * NO real payment: upgrade leads to a "Bientôt disponible" toast.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Crown, Lock, PartyPopper, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import DemoBadge from "@/components/shared/DemoBadge";
import ErrorState from "@/components/shared/ErrorState";
import PageLoader from "@/components/shared/PageLoader";
import BenefitsList from "@/components/trial/BenefitsList";
import LockedPremiumCard from "@/components/trial/LockedPremiumCard";
import TrialCountdown from "@/components/trial/TrialCountdown";
import UpgradeButton from "@/components/trial/UpgradeButton";
import DemoTrialTools from "@/components/trial/DemoTrialTools";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-client";
import { formatDate } from "@/lib/access";
import type { LatestResult, TrialStatus } from "@/lib/types";

export default function TrialPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();

  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [latest, setLatest] = useState<LatestResult | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [activating, setActivating] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  const load = useCallback(() => {
    setFetching(true);
    setError("");
    Promise.all([api.trial.status(), api.results.latest()])
      .then(([t, r]) => {
        setTrial(t);
        setLatest(r);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (loading || !session) return <PageLoader message="Chargement de ton espace…" />;

  const activate = () => {
    setActivating(true);
    api.trial
      .start()
      .then((t) => {
        setTrial(t);
        setJustActivated(true);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Impossible d'activer l'aperçu pour le moment.")
      )
      .finally(() => setActivating(false));
  };

  const advancedDone = latest?.kind === "premium";
  const basicDone = latest !== null;

  /* ------------------------------ Render ------------------------------ */
  return (
    <main className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBadge />
          <DemoTrialTools onChanged={load} />
        </div>

        {fetching && <PageLoader message="Vérification de ton accès Premium…" />}

        {!fetching && error && (
          <ErrorState
            title="Aperçu Premium indisponible"
            description={error}
            onRetry={load}
            onDemoFallback={() => {
              setTrial(demoBackendFallbackTrial());
              setError("");
            }}
          />
        )}

        {!fetching && !error && trial && (
          <>
            {/* ---------------- Confirmation after activation ---------------- */}
            {justActivated && trial.status === "active" ? (
              <section className="rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <FoxGuide
                  stage="trial"
                  mood="celebrating"
                  message="C'est activé ! Profite de ton Aperçu Premium pendant 3 jours 🎉"
                />
                <h1 className="mt-6 flex items-center justify-center gap-2 text-2xl font-bold text-stone-900">
                  <PartyPopper className="h-6 w-6 text-emerald-600" aria-hidden />
                  Aperçu Premium activé !
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                  Tu as maintenant accès à l&apos;évaluation approfondie, au résultat détaillé en 4 sections,
                  aux ressources et à ton parcours personnalisé jusqu&apos;au{" "}
                  <strong>{formatDate(trial.expiresAt)}</strong>. Aucune carte bancaire requise.
                </p>
                <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
                  <Button
                    onClick={() => router.push("/assessment/advanced")}
                    className="gap-2"
                  >
                    Passer à l&apos;évaluation approfondie <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" onClick={() => setJustActivated(false)}>
                    Voir mon espace Premium
                  </Button>
                </div>
              </section>
            ) : trial.status === "not_started" ? (
              /* ---------------- Activation screen ---------------- */
              <section className="space-y-5">
                <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm sm:p-8">
                  <FoxGuide
                    stage="trial"
                    mood="encouraging"
                    message="Débloque mon analyse complète : 3 jours gratuits, sans carte bancaire. Que veux-tu savoir de plus ?"
                  />
                  <h1 className="mt-6 flex items-center gap-2 text-2xl font-bold text-stone-900">
                    <Crown className="h-6 w-6 text-orange-600" aria-hidden />
                    Aperçu Premium — 3 jours gratuits
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                    Passe à l&apos;analyse approfondie : {session.user.name.split(" ")[0]}, Rafi affine ton orientation avec
                    10 questions en plus, un résultat détaillé en 4 sections et un plan d&apos;action complet.
                  </p>
                  <Button
                    size="lg"
                    onClick={activate}
                    disabled={activating}
                    className="mt-5 w-full gap-2 sm:w-auto"
                  >
                    {activating ? (
                      "Activation…"
                    ) : (
                      <>
                        <Crown className="h-5 w-5" aria-hidden />
                        Activer mon aperçu gratuit de 3 jours
                      </>
                    )}
                  </Button>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    Sans carte bancaire · À la fin, retour automatique au plan gratuit
                  </p>
                </div>
                <BenefitsList columns={2} />
                <LockedPremiumCard
                  title="Résultat Premium : orientation détaillée"
                  teaser="Scores de compatibilité détaillés, forces et difficultés pour chaque domaine, alternatives personnalisées…"
                />
              </section>
            ) : trial.status === "active" ? (
              /* ---------------- Active trial ---------------- */
              <section className="space-y-5">
                <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                        <Crown className="h-3.5 w-3.5" aria-hidden />
                        Aperçu Premium actif
                      </span>
                      <h1 className="mt-3 text-2xl font-bold text-stone-900">Ton accès Premium est ouvert</h1>
                      <p className="mt-1 text-sm text-stone-600">
                        Démarré le {formatDate(trial.startedAt)} · se termine le {formatDate(trial.expiresAt)}
                      </p>
                    </div>
                    {trial.expiresAt && <TrialCountdown expiresAt={trial.expiresAt} />}
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    {!basicDone ? (
                      <Button asChild className="flex-1 gap-2">
                        <Link href="/assessment/basic">
                          Commencer l&apos;évaluation de base <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    ) : !advancedDone ? (
                      <Button asChild className="flex-1 gap-2">
                        <Link href="/assessment/advanced">
                          Passer l&apos;évaluation approfondie <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="flex-1 gap-2">
                        <Link href="/results/premium">
                          Voir mon résultat Premium <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/dashboard">Mon tableau de bord</Link>
                    </Button>
                  </div>
                </div>

                <BenefitsList columns={2} />

                {!advancedDone && (
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-stone-500">
                      <Lock className="h-4 w-4" aria-hidden /> Ce qui t&apos;attend après l&apos;évaluation approfondie
                    </h2>
                    <LockedPremiumCard
                      title="Soft skills : tes 3 priorités"
                      teaser="Niveau actuel, importance et plan d'action hebdomadaire pour chaque compétence…"
                    />
                    <LockedPremiumCard
                      title="Parcours en 4 étapes"
                      teaser="Explorer, apprendre, pratiquer, préparer : tes prochaines étapes jusqu'aux candidatures…"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-base font-bold text-stone-900">Tu veux garder Premium après l&apos;aperçu ?</h2>
                      <p className="mt-0.5 text-sm text-stone-600">
                        Le paiement en ligne arrive bientôt — en attendant, profite de tes 3 jours !
                      </p>
                    </div>
                    <UpgradeButton label="Passer à Premium" />
                  </div>
                </div>
              </section>
            ) : trial.status === "expired" ? (
              /* ---------------- Expired trial ---------------- */
              <section className="space-y-5">
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                  <FoxGuide
                    stage="trial"
                    mood="concerned"
                    message="Ton aperçu de 3 jours est terminé. Pas de panique : tu gardes l'accès gratuit pour toujours !"
                  />
                  <h1 className="mt-6 text-2xl font-bold text-stone-900">Aperçu Premium expiré</h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                    Terminé le {formatDate(trial.expiresAt)}. Ton plan gratuit inclut toujours : l&apos;évaluation de
                    base, ton résultat gratuit et le tableau de bord essentiel.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/results/free">Revoir mon résultat gratuit</Link>
                    </Button>
                    <UpgradeButton className="flex-1" label="Réactiver Premium (bientôt)" />
                  </div>
                  <p className="mt-3 text-xs text-stone-400">
                    🔒 Ton résultat Premium détaillé reste visible ci-dessous si tu l&apos;avais obtenu, mais les
                    nouvelles analyses avancées nécessitent un accès Premium.
                  </p>
                </div>
                <LockedPremiumCard
                  title="Nouvelle analyse approfondie"
                  teaser="Relance une analyse complète de ton profil avec les dernières données…"
                />
              </section>
            ) : (
              /* ---------------- Subscribed (full access marker) ---------------- */
              <section className="rounded-3xl border border-orange-300 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-md sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                  <Crown className="h-3.5 w-3.5" aria-hidden />
                  Premium
                </span>
                <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-stone-900">Tu es membre Premium<Crown className="h-6 w-6 text-amber-500" aria-hidden /></h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                  Accès complet débloqué : évaluations avancées, résultats détaillés illimités, ressources et
                  parcours personnalisés. (Mode démonstration : aucun paiement réel n&apos;a été effectué.)
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="flex-1 gap-2">
                    <Link href="/results/premium">
                      Mon résultat Premium <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/dashboard">Mon tableau de bord</Link>
                  </Button>
                </div>
              </section>
            )}

            {trial.status === "not_started" && (
              <p className="text-center text-xs text-stone-400">
                Plan gratuit actif — l&apos;évaluation de base et le résultat gratuit restent accessibles sans Premium.
              </p>
            )}

            {justActivated === false && trial.status !== "active" && (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Tes données et ta progression sont conservées entre les plans.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* Fallback utilisé uniquement si l'API est indisponible dans cette page. */
function demoBackendFallbackTrial(): TrialStatus {
  return {
    status: "not_started",
    startedAt: null,
    expiresAt: null,
    daysRemaining: 0,
    accessLevel: "free",
  };
}
