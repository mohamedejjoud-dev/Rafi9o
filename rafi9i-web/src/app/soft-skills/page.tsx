import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import SoftSkillsPageContent from "@/components/marketing/SoftSkillsPageContent";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Soft skills : les compétences qui font la différence",
  description:
    "Communication, travail en équipe, gestion du temps, leadership… Découvre pourquoi les soft skills comptent autant que les notes, et comment Rafi9i t'aide à identifier puis développer les tiennes.",
  path: "/soft-skills",
});

export default function SoftSkillsPage() {
  return (
    <PublicShell>
      <SoftSkillsPageContent />
    </PublicShell>
  );
}
