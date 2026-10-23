/**
 * Rafi9i — Shared error state with retry + demo fallback (Developer 2)
 */
"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import { useI18n } from "@/lib/i18n";

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
  title,
  description,
  onRetry,
  retryLabel,
  onDemoFallback,
  fallbackLabel,
  className = "",
}: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div
      className={`mx-auto max-w-md rounded-2xl border border-red-100 bg-card p-6 shadow-sm dark:border-red-900/50 ${className}`}
      role="alert"
    >
      <FoxGuide
        stage="results"
        mood="concerned"
        message={t("pub.errorState.fox")}
        compact
      />
      <h3 className="mt-4 text-base font-semibold text-foreground">{title ?? t("pub.errorState.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="h-4 w-4" aria-hidden />
            {retryLabel ?? t("pub.common.retry")}
          </Button>
        )}
        {onDemoFallback && (
          <Button size="sm" onClick={onDemoFallback} className="gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden />
            {fallbackLabel ?? t("pub.errorState.fallback")}
          </Button>
        )}
      </div>
    </div>
  );
}
