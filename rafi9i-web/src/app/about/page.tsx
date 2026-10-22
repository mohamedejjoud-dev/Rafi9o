import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import AboutPageContent from "@/components/marketing/AboutPageContent";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "À propos : la mission de Rafi9i",
  description:
    "Rafi9i est une plateforme d'orientation, de développement des soft skills et de suivi pour les lycéens du Maroc, guidés par Rafi.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PublicShell>
      <AboutPageContent />
    </PublicShell>
  );
}
