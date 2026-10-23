/**
 * Rafi9i — PricingCard (Luminous Educational Edition)
 * Clean, trustworthy pricing cards with amber/orange highlights and emerald checks.
 */
"use client";

import { Check } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { useI18n } from "@/lib/i18n";

export interface PricingCardProps {
  name: string;
  /** Human price label. */
  price: string | null;
  pricePeriod?: string;
  recommendationLabel?: string;
  unavailableLabel?: string;
  description: string;
  features: string[];
  cta: { href: string; label: string };
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({
  name,
  price,
  pricePeriod,
  recommendationLabel,
  unavailableLabel,
  description,
  features,
  cta,
  highlighted = false,
  badge,
}: PricingCardProps) {
  const { t } = useI18n();
  return (
    <article
      className={`rafi-card rafi-card-hover relative flex h-full flex-col p-7 sm:p-8 ${
        highlighted
          ? "border-2 border-orange-500 shadow-xl shadow-orange-500/10"
          : "shadow-sm"
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm">
          {badge}
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{name}</h3>
        {highlighted && !badge && (
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
            {recommendationLabel ?? t("pricing.recommended")}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>

      <div className="mt-6 flex items-baseline gap-2 border-b border-slate-100 dark:border-slate-800 pb-6">
        {price ? (
          <span className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">{price}</span>
        ) : (
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{unavailableLabel ?? t("status.soon")}</span>
        )}
        {price && (
          <span className="text-xs text-muted-foreground">
            {pricePeriod ?? t("pricing.freePeriod")}
          </span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" strokeWidth={3} aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-4">
        {highlighted ? (
          <PrimaryButton href={cta.href} className="w-full">
            {cta.label}
          </PrimaryButton>
        ) : (
          <SecondaryButton href={cta.href} className="w-full">
            {cta.label}
          </SecondaryButton>
        )}
      </div>
    </article>
  );
}
