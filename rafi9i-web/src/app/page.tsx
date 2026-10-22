/**
 * Rafi9i — Public landing page (Developer 1)
 * Server-rendered, static demo content only: the landing works even
 * when the backend is unavailable. Kept deliberately short:
 * hero → features → steps → preview → pricing → CTA.
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/components/marketing/Hero";
import ProductPillars from "@/components/marketing/ProductPillars";
import HowItWorks from "@/components/marketing/HowItWorks";
import ProductPreview from "@/components/marketing/ProductPreview";
import PricingPreview from "@/components/marketing/PricingPreview";
import FinalCTA from "@/components/marketing/FinalCTA";
import { buildMetadata } from "@/lib/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Rafi9i — Ton parcours commence par mieux te connaître",
  description:
    "Découvre les domaines qui te correspondent, développe tes soft skills et construis ton parcours académique et professionnel — évaluation de base gratuite pour les lycéens et étudiants du Maroc.",
  path: "/",
});

export default function LandingPage() {
  return (
    <PublicShell>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Hero />
      <ProductPillars />
      <HowItWorks />
      <ProductPreview />
      <PricingPreview />
      <FinalCTA />
    </PublicShell>
  );
}
