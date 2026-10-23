/**
 * Rafi9i — Privacy policy (MVP working draft) (Developer 1)
 * Honest MVP-level policy: what is collected, how it is used, rights and
 * contact. Clearly marked as a working draft to be finalized before
 * public launch. Metadata stays in French (SEO); the visible text is
 * translated (keys `pub.privacy.*` in lib/translations/public.ts).
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import LegalDocument from "../LegalDocument";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment Rafi9i collecte, utilise et protège tes données pendant le MVP : compte, réponses aux évaluations, résultats et progression — et comment exercer tes droits.",
  path: "/legal/privacy",
});

/** Paragraph count per section (sections 1 → 8). */
const PARAGRAPHS = [1, 5, 4, 2, 1, 2, 1, 1];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <LegalDocument
        prefix="pub.privacy"
        path="/legal/privacy"
        titleKey="pub.privacy.title"
        breadcrumbKey="footer.privacy"
        paragraphs={PARAGRAPHS}
      />
    </PublicShell>
  );
}
