/**
 * Rafi9i — Terms of use (MVP working draft) (Developer 1)
 * Honest, readable terms: what the service is, no-guarantee framing,
 * demo status, accounts, IP, contact. Clearly marked as a working draft.
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conditions d'utilisation",
  description:
    "Les conditions d'utilisation de Rafi9i pendant le MVP : accès au service, nature indicative des recommandations, comptes, propriété intellectuelle et limites de responsabilité.",
  path: "/legal/terms",
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Objet",
    body: [
      "Les présentes conditions régissent l'accès au service Rafi9i, une plateforme d'orientation académique, de développement des soft skills et de suivi de parcours destinée aux lycéens et étudiants. En créant un compte, tu acceptes ces conditions.",
    ],
  },
  {
    title: "2. Accès au service",
    body: [
      "L'accès nécessite un compte (nom, e-mail, mot de passe). Tu t'engages à fournir des informations exactes et à ne pas partager ton compte. Le service s'adresse aux élèves d'environ 16 ans et plus ; les utilisateurs mineurs sont invités à en parler à leurs parents ou tuteurs.",
      "Nous nous efforçons d'assurer une bonne disponibilité, mais le service est fourni « en l'état » pendant sa phase de construction : des interruptions ou évolutions peuvent survenir sans préavis.",
    ],
  },
  {
    title: "3. Gratuité et Premium Preview",
    body: [
      "L'évaluation de base est gratuite. Le Premium Preview ouvre 3 jours d'accès aux analyses approfondies. Pendant le MVP, aucun paiement n'est possible : aucune carte bancaire n'est demandée et aucun prélèvement ne peut être effectué.",
      "L'abonnement Premium coûte 19 DH par mois. Le paiement sera activé ultérieurement ; ces conditions seront mises à jour avant toute ouverture de paiement.",
    ],
  },
  {
    title: "4. Nature des recommandations",
    body: [
      "Les résultats, scores de compatibilité, priorités de soft skills et roadmaps proposés par Rafi9i sont indicatifs. Ils constituent une aide à la réflexion et ne représentent ni une garantie d'admission dans un établissement, ni une promesse de réussite académique ou d'emploi, ni un diagnostic psychologique, ni un avis officiel d'orientation.",
      "Les décisions d'orientation t'appartiennent ; nous te encourageons à les croiser avec tes professeurs, tes proches et les sources officielles des établissements.",
    ],
  },
  {
    title: "5. Données de démonstration",
    body: [
      "Pendant le MVP, certains contenus (exemples de résultats, bibliothèque de ressources) s'appuient sur un jeu de données de démonstration, clairement badgé comme tel. Ces contenus illustrent le fonctionnement du service et ne représentent pas une offre réelle.",
    ],
  },
  {
    title: "6. Comportement attendu",
    body: [
      "Tu t'engages à utiliser le service loyalement : pas de tentative d'intrusion, pas d'extraction massive de contenu, pas d'usage des réponses générées pour porter préjudice à autrui.",
    ],
  },
  {
    title: "7. Propriété intellectuelle",
    body: [
      "Le site, sa charte, son interface, le personnage Rafi et les contenus textuels sont la propriété de l'équipe Rafi9i. Les contenus de ressources présentés à titre de démonstration restent la propriété de leurs auteurs respectifs et ne sont pas diffusés sur la plateforme.",
    ],
  },
  {
    title: "8. Responsabilité",
    body: [
      "Dans la mesure permise par la loi, Rafi9i ne saurait être tenu responsable des décisions prises sur la base des recommandations affichées, ni des dommages indirects liés à l'utilisation du service pendant sa phase de construction.",
    ],
  },
  {
    title: "9. Évolution des conditions",
    body: [
      "Ces conditions évolueront avec le produit (notamment à l'ouverture du paiement et à l'arrivée de l'arabe). La version applicable est celle affichée sur cette page ; les changements substantiels seront signalés.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PublicShell>
      <PageContainer className="pt-8">
        <Breadcrumbs
          items={[
            { name: "Accueil", path: "/" },
            { name: "Conditions d'utilisation", path: "/legal/terms" },
          ]}
        />

        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Conditions d&apos;utilisation</h1>
          <p className="mt-3 text-sm text-stone-500">Version de travail — MVP. Dernière mise à jour : octobre 2025.</p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-navy-900">{section.title}</h2>
                <div className="mt-2.5 space-y-2.5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-stone-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </PageContainer>
    </PublicShell>
  );
}
