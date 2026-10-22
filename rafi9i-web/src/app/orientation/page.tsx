import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import OrientationPageContent from "@/components/marketing/OrientationPageContent";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Orientation académique : choisir sa voie avec méthode",
  description:
    "Comprends ce qu'est l'orientation académique, ce que Rafi9i étudie dans ton profil, et comment l'évaluation gratuite génère des recommandations — expliqué simplement, sans promesses irréalistes.",
  path: "/orientation",
});

export default function OrientationPage() {
  return (
    <PublicShell>
      <OrientationPageContent />
    </PublicShell>
  );
}
