/**
 * Rafi9i — Demonstration tools for the trial (Developer 2)
 * Lets a reviewer toggle every trial state + simulate an AI failure.
 * Clearly identified as demo-only UI; harmless in production.
 */
"use client";

import { useEffect, useState } from "react";
import { Bug, Crown, FlaskConical, RotateCcw, Timer, TimerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  isAiFailureSimulated,
  resetAllDemoData,
  resetTrial,
  setAiFailureSimulated,
  simulateExpiredTrial,
  simulateSubscribed,
  startTrial,
} from "@/lib/mocks";

export default function DemoTrialTools({ onChanged }: { onChanged: () => void }) {
  const { toast } = useToast();
  const [aiFail, setAiFail] = useState(false);

  useEffect(() => {
    setAiFail(isAiFailureSimulated());
  }, []);

  const run = (fn: () => void, message: string) => {
    fn();
    toast({ title: "Outil de démonstration", description: message });
    onChanged();
  };

  return (
    <details className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3 text-stone-600">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-stone-500">
        <FlaskConical className="h-4 w-4" aria-hidden />
        Outils de démonstration (états de l&apos;essai, échec IA)
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => startTrial(), "Essai actif simulé (3 jours).")}
        >
          <Timer className="h-4 w-4" aria-hidden /> Simuler essai actif
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => simulateExpiredTrial(), "Essai expiré simulé.")}
        >
          <TimerOff className="h-4 w-4" aria-hidden /> Simuler expiration
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => simulateSubscribed(), "Abonnement Premium simulé (démo).")}
        >
          <Crown className="h-4 w-4" aria-hidden /> Simuler Premium
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => resetTrial(), "Essai réinitialisé (non commencé).")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Réinitialiser l&apos;essai
        </Button>
        <Button
          variant={aiFail ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 ${aiFail ? "bg-red-600 text-white hover:bg-red-700" : ""}`}
          onClick={() => {
            const next = !isAiFailureSimulated();
            setAiFailureSimulated(next);
            setAiFail(next);
            toast({
              title: "Outil de démonstration",
              description: next
                ? "Échec IA activé : les prochains résultats afficheront le fallback déterministe."
                : "Échec IA désactivé.",
            });
          }}
        >
          <Bug className="h-4 w-4" aria-hidden /> {aiFail ? "Désactiver" : "Simuler"} l&apos;échec IA
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => run(() => resetAllDemoData(), "Toutes les données de démo ont été réinitialisées.")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Tout réinitialiser
        </Button>
      </div>
    </details>
  );
}
