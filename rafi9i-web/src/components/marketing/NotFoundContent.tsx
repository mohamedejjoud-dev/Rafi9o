/**
 * Rafi9i — 404 content (client island so the copy follows the UI locale).
 */
"use client";

import Link from "next/link";
import RafiFox from "@/components/mascot/RafiFox";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";
import { useI18n } from "@/lib/i18n";

export default function NotFoundContent() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <div className="rf-float">
        <RafiFox mood="thinking" size={170} />
      </div>
      <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-semibold text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        {t("pub.notFound.badge")}
      </span>
      <h1 className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl">
        {t("pub.notFound.title")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        {t("pub.notFound.body")}
      </p>
      <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
        <PrimaryButton href="/" size="lg">
          {t("pub.common.backHome")}
        </PrimaryButton>
        <SecondaryButton href="/orientation" size="lg">
          {t("pub.notFound.explore")}
        </SecondaryButton>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {t("pub.notFound.hasAccount")}{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-orange-700 underline decoration-orange-300 hover:text-orange-800 dark:text-orange-400 dark:decoration-orange-800 dark:hover:text-orange-300"
        >
          {t("pub.notFound.login")}
        </Link>
      </p>
    </div>
  );
}
