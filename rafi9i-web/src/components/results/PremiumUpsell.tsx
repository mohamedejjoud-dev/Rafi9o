/**
 * Rafi9i — Premium Preview call-to-action (Developer 2)
 */
"use client";

import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoxGuide from "@/components/fox/FoxGuide";

const BENEFITS = [
  "Évaluation approfondie (10 questions supplémentaires)",
  "Résultat détaillé : orientation, soft skills, ressources, parcours",
  "3 soft skills prioritaires avec plan d'action",
  "10 ressources et un roadmap sur 4 étapes",
  "3 jours gratuits, sans carte bancaire",
];

export default function PremiumUpsell({ className = "" }: { className?: string }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm sm:p-6 ${className}`}
      aria-labelledby="premium-upsell-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <FoxGuide
          stage="trial"
          mood="encouraging"
          compact
          message="Envie d'aller plus loin ? L'Aperçu Premium débloque toute mon analyse pendant 3 jours !"
        />
        <div className="flex-1">
          <h2 id="premium-upsell-title" className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <Crown className="h-5 w-5 text-orange-600" aria-hidden />
            Aperçu Premium — 3 jours gratuits
          </h2>
          <ul className="mt-3 space-y-1.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-4 gap-2"
          >
            <Link href="/trial">
              <Crown className="h-4 w-4" aria-hidden />
              Découvrir l&apos;Aperçu Premium
            </Link>
          </Button>
          <p className="mt-2 text-[11px] text-stone-400">
            Sans engagement · Le paiement en ligne arrive bientôt (Bientôt disponible).
          </p>
        </div>
      </div>
    </section>
  );
}
