/**
 * Rafi9i — Public pricing page (Developer 1)
 * Free vs Premium plans, WhatsApp transfer payment explanation, visible FAQ
 * (mirrored in FAQPage JSON-LD). No fake checkout: Premium (19 DH) is paid
 * by bank transfer over WhatsApp and activated by an admin.
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
    "L'évaluation de base et le quiz IA de Rafi9i sont gratuits. Premium (19 DH) débloque l'analyse complète et le chat avec Rafi IA : paiement par virement via WhatsApp, activation après vérification.",
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
    question: "Qu'ajoute exactement Premium ?",
    answer:
      "Premium débloque l'évaluation avancée (10 questions supplémentaires), l'analyse détaillée de ton profil, le chat avec Rafi IA, un plan de soft skills, la roadmap en 4 étapes et le suivi étendu.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Par virement de 19 DH. Le bouton Premium ouvre WhatsApp avec un message prêt ; tu envoies la preuve de virement et un administrateur active ton compte, en général en moins de 24 h.",
  },
  {
    question: "Combien coûte l'abonnement Premium ?",
    answer:
      "Premium coûte 19 DH. Le paiement se fait par virement, vérifié par notre équipe via WhatsApp.",
  },
  {
    question: "Rafi9i garantit-il mon admission dans une école ?",
    answer:
      "Non. Rafi9i fournit des recommandations indicatives basées sur ton profil. Elles ne garantissent ni admission, ni réussite académique ou emploi, et ne constituent pas un diagnostic psychologique.",
  },
  {
    question: "Que se passe-t-il pendant la vérification ?",
    answer:
      "Ton compte reste sur le plan gratuit : le quiz IA et ton résultat de base restent accessibles. Premium s'active dès que le virement est confirmé.",
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
