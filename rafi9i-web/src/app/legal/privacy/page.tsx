/**
 * Rafi9i — Privacy policy (MVP working draft) (Developer 1)
 * Honest MVP-level policy: what is collected, how it is used, rights and
 * contact. Clearly marked as a working draft to be finalized before
 * public launch.
 */
import type { Metadata } from "next";
import PublicShell from "@/components/navigation/PublicShell";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment Rafi9i collecte, utilise et protège tes données pendant le MVP : compte, réponses aux évaluations, résultats et progression — et comment exercer tes droits.",
  path: "/legal/privacy",
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Qui sommes-nous ?",
    body: [
      "Rafi9i est une plateforme en cours de construction qui propose de l'orientation académique, du développement des soft skills et un suivi de parcours pour les lycéens et étudiants du Maroc.",
    ],
  },
  {
    title: "2. Les données que nous collectons",
    body: [
      "Données de compte : nom, adresse e-mail, mot de passe (stocké sous forme chiffrée par le serveur d'authentification, jamais en clair).",
      "Données de profil : ville, filière du baccalauréat, langue préférée et informations d'onboarding que tu renseignes volontairement.",
      "Données d'évaluation : tes réponses aux questionnaires de base et avancés, les résultats d'orientation, les priorités de soft skills et les éléments de roadmap générés.",
      "Données de progression : ressources consultées, éléments enregistrés, défis hebdomadaires et étapes complétées.",
      "Aucune donnée bancaire n'est collectée : le paiement n'est pas actif pendant le MVP.",
    ],
  },
  {
    title: "3. Comment nous utilisons ces données",
    body: [
      "Produire tes résultats d'orientation : les réponses sont traitées par un calcul déterministe puis enrichies d'explications personnalisées via un service d'intelligence artificielle.",
      "Personnaliser ton espace : roadmap, priorités de soft skills et recommandations de ressources.",
      "Améliorer le produit, sur la base de données agrégées et anonymisées autant que possible.",
      "Nous ne vendons pas tes données personnelles et ne les utilisons pas pour de la publicité ciblée.",
    ],
  },
  {
    title: "4. Où sont stockées les données, et comment elles sont protégées",
    body: [
      "Pendant le MVP, les données de compte et de parcours sont stockées sur les serveurs de la plateforme ; l'authentification utilise des jetons de session conservés dans le stockage local de ton navigateur.",
      "Nous appliquons des mesures raisonnables de protection (transport chiffré, contrôle d'accès). Comme pour tout service en construction, aucune méthode de transmission n'est infaillible : n'utilise pas un mot de passe déjà employé ailleurs.",
    ],
  },
  {
    title: "5. Durée de conservation",
    body: [
      "Ton compte et tes résultats sont conservés tant que ton compte existe. Tu peux demander la suppression de ton compte et de ses données à tout moment (voir section 6).",
    ],
  },
  {
    title: "6. Tes droits",
    body: [
      "Tu peux demander l'accès à tes données, leur rectification ou leur suppression par les canaux de contact qui seront publiés sur le site avant son ouverture publique. Nous répondons dans un délai raisonnable (30 jours maximum).",
      "Si tu es mineur, demande à un parent ou tuteur de te accompagner dans ces démarches.",
    ],
  },
  {
    title: "7. Cookies et stockage local",
    body: [
      "Le site utilise le stockage local de ton navigateur pour conserver ta session et tes préférences d'affichage. Aucun cookie publicitaire ou traceur tiers n'est installé pendant le MVP.",
    ],
  },
  {
    title: "8. Évolution de cette politique",
    body: [
      "Ce document est une version de travail liée au MVP. Il sera finalisé et complété (notamment sur l'hébergement et les sous-traitants) avant l'ouverture publique du service. Les modifications substantielles seront signalées sur cette page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PageContainer className="pt-8">
        <Breadcrumbs
          items={[
            { name: "Accueil", path: "/" },
            { name: "Confidentialité", path: "/legal/privacy" },
          ]}
        />

        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Politique de confidentialité</h1>
          <p className="mt-3 text-sm text-stone-500">Version de travail — MVP. Dernière mise à jour : octobre 2025.</p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title} aria-labelledby={section.title.replace(/[^a-zA-Z0-9]/g, "")}>
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
