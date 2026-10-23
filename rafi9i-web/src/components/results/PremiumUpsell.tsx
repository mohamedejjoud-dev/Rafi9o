/**
 * Rafi9i — Premium call-to-action (paid via WhatsApp, verified by an admin)
 */
"use client";

import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";
import { useI18n } from "@/lib/i18n";

const BENEFITS = [
  "premium.benefit.1.title",
  "premium.benefit.2.title",
  "premium.benefit.3.title",
  "premium.benefit.4.title",
  "premium.benefit.5.title",
  "premium.benefit.pay.title",
] as const;

export default function PremiumUpsell({ className = "" }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 dark:border-orange-900/50 dark:from-orange-950/40 dark:via-card dark:to-amber-950/30 shadow-sm sm:p-6 ${className}`}
      aria-labelledby="premium-upsell-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <FoxGuide stage="trial" mood="encouraging" compact message={t("ai.locked.text")} />
        <div className="flex-1">
          <h2 id="premium-upsell-title" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
            {t("premium.page.title")} · {t("premium.price")}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {BENEFITS.map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
                {t(key)}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-4 gap-2">
            <Link href="/trial">
              <Crown className="h-4 w-4" aria-hidden />
              {t("ai.locked.cta")}
            </Link>
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">{t("premium.step3.text")}</p>
        </div>
      </div>
    </section>
  );
}
