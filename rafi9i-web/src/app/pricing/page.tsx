/**
 * Rafi9i — Public pricing page (Developer 1)
 * Free vs Premium plans, 3-day Premium Preview explanation, visible FAQ
 * (mirrored in FAQPage JSON-LD), honest "payment not active in the MVP"
 * note. No invented prices, no fake checkout.
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import JsonLd from "@/components/seo/JsonLd";
import PricingPageContent from "@/components/marketing/PricingPageContent";
import { buildMetadata } from "@/lib/metadata";
import { faqJsonLd, type FaqEntry } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Tarifs : commencez gratuitement, évoluez ensuite",
  description:
    "L'évaluation de base de Rafi9i est gratuite. Le Premium Preview ouvre 3 jours d'analyse complète sans paiement. Découvrez ce que contient chaque offre et quand l'abonnement complet sera disponible.",
  path: "/pricing",
});

/* The FAQ below is visible content — the JSON-LD mirrors it exactly. */
const FAQ: FaqEntry[] = [
  {
    question: "L'évaluation de base est-elle vraiment gratuite ?",
    answer:
      "Oui. Le questionnaire de base (12 questions), le résumé de ton profil, trois domaines possibles et une première piste de soft skills sont gratuits, sans carte bancaire et sans engagement.",
  },
  {
    question: "Qu'ajoute exactement le Premium Preview ?",
    answer:
      "L'essai de 3 jours débloque l'évaluation avancée (10 questions supplémentaires), l'analyse détaillée de ton profil, les explications des domaines, un plan de soft skills, la roadmap en 4 étapes et le suivi étendu.",
  },
  {
    question: "Dois-je payer pour essayer le Premium Preview ?",
    answer:
      "Non. Le paiement est inactif pendant le MVP : l'essai de 3 jours est ouvert sans carte bancaire et aucun prélèvement n'est possible.",
  },
  {
    question: "Combien coûte l'abonnement Premium ?",
    answer:
      "Premium coûte 19 DH par mois. Le paiement n'est pas encore activé ; ce montant ne sera facturé qu'après l'ouverture officielle de l'abonnement.",
  },
  {
    question: "Rafi9i garantit-il mon admission dans une école ?",
    answer:
      "Non. Rafi9i fournit des recommandations indicatives basées sur ton profil. Elles ne garantissent ni admission, ni réussite académique ou emploi, et ne constituent pas un diagnostic psychologique.",
  },
  {
    question: "Que se passe-t-il à la fin des 3 jours d'essai ?",
    answer:
      "Tu retrouves l'accès gratuit : ton profil, tes résultats de base et ton suivi limité restent consultables. Rien n'est supprimé et aucun paiement n'est possible pendant le MVP.",
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <JsonLd data={faqJsonLd(FAQ)} />
      <PricingPageContent />
    </PublicShell>
  );
}
