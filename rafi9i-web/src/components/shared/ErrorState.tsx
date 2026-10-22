/**
 * Rafi9i — Shared error state with retry + demo fallback (Developer 2)
 */
"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";

export interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  onDemoFallback?: () => void;
  fallbackLabel?: string;
  className?: string;
}

export default function ErrorState({
  title = "Oups, une erreur est survenue",
  description,
  onRetry,
  retryLabel = "Réessayer",
  onDemoFallback,
  fallbackLabel = "Continuer en mode démo",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`mx-auto max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-sm ${className}`}
      role="alert"
    >
      <FoxGuide
        stage="results"
        mood="concerned"
        message="Aïe… quelque chose s'est mal passé. On peut réessayer ensemble !"
        compact
      />
      <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="h-4 w-4" aria-hidden />
            {retryLabel}
          </Button>
        )}
        {onDemoFallback && (
          <Button size="sm" onClick={onDemoFallback} className="gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden />
            {fallbackLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
