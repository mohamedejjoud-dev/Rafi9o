/**
 * Rafi9i — Terms of use (MVP working draft) (Developer 1)
 * Honest, readable terms: what the service is, no-guarantee framing,
 * demo status, accounts, IP, contact. Clearly marked as a working draft.
 * Metadata stays in French (SEO); the visible text is translated
 * (keys `pub.terms.*` in lib/translations/public.ts).
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import LegalDocument from "../LegalDocument";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conditions d'utilisation",
  description:
    "Les conditions d'utilisation de Rafi9i pendant le MVP : accès au service, nature indicative des recommandations, comptes, propriété intellectuelle et limites de responsabilité.",
  path: "/legal/terms",
});

/** Paragraph count per section (sections 1 → 9). */
const PARAGRAPHS = [1, 2, 2, 2, 1, 1, 1, 1, 1];

export default function TermsPage() {
  return (
    <PublicShell>
      <LegalDocument
        prefix="pub.terms"
        path="/legal/terms"
        titleKey="footer.terms"
        breadcrumbKey="footer.terms"
        paragraphs={PARAGRAPHS}
      />
    </PublicShell>
  );
}
