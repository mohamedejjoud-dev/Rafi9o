/**
 * Rafi9i — global error boundary
 * Client component with Rafi in his concerned/amber state.
 */
"use client";

import { useEffect } from "react";
import RafiFox from "@/components/mascot/RafiFox";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";
import { useI18n } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="rf-pulse">
        <RafiFox mood="concerned" size={150} />
      </div>
      <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 dark:bg-amber-400" />
        {t("pub.error.badge")}
      </span>
      <h1 className="mt-4 text-3xl font-extrabold text-foreground sm:text-5xl">
        {t("pub.error.title")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        {t("pub.error.body")}
      </p>
      <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
        <PrimaryButton onClick={reset} size="lg">
          {t("pub.common.retry")}
        </PrimaryButton>
        <SecondaryButton href="/" size="lg">
          {t("pub.common.backHome")}
        </SecondaryButton>
      </div>
    </div>
  );
}
