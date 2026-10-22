/**
 * Rafi9i — global error boundary (Cyber Edition)
 * Client component with 3D Rafi AI Core in concerned/amber state.
 */
"use client";

import { useEffect } from "react";
import RafiFox from "@/components/mascot/RafiFox";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="rf-pulse">
        <RafiFox mood="concerned" size={150} />
      </div>
      <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Anomalie Système
      </span>
      <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
        Interruption de Télémesure
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
        Le moteur Rafi AI a rencontré une exception inattendue. Clique sur Réessayer pour relancer le module ou retourne à la console.
      </p>
      <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
        <PrimaryButton onClick={reset} size="lg">
          Réinitialiser le module
        </PrimaryButton>
        <SecondaryButton href="/" size="lg">
          Retour à l&apos;accueil
        </SecondaryButton>
      </div>
    </div>
  );
}
