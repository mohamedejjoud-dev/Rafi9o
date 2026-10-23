/**
 * Rafi9i — Public resources page (Developer 1)
 * Static demo library (server-rendered for SEO) + client-side filters.
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import PageContainer from "@/components/shared/PageContainer";
import ResourcesPageContent from "@/components/marketing/ResourcesPageContent";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Ressources : cours, podcasts et e-books pour avancer",
  description:
    "Explore des ressources de démonstration choisies pour l'orientation et le développement des soft skills : méthodologie, choix de filière, organisation des révisions et prise de parole.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <PublicShell>
      <PageContainer className="pt-8">
        <ResourcesPageContent />
      </PageContainer>
    </PublicShell>
  );
}
