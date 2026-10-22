/**
 * Rafi9i — Public demo content (Developer 1)
 * Static seed used by the public resources page and the landing
 * preview. Everything is demonstration content: no external links, no
 * copyrighted material, always badged "Démo" in the UI.
 */
import type { PublicResource } from "@/components/shared/ResourceCard";

export const PUBLIC_RESOURCES: PublicResource[] = [
  {
    type: "cours",
    title: "Apprendre à apprendre : la méthode active",
    description:
      "Comprendre pourquoi relire ne suffit pas, et s'entraîner aux techniques qui font vraiment retenir : rappel actif, espacement, exemples concrets.",
    duration: "45 min",
    topic: "Soft skills · Méthodologie",
    access: "free",
  },
  {
    type: "cours",
    title: "Parler en public avec assurance",
    description:
      "Structurer un exposé, gérer le trac et captiver son auditoire — un entraînement progressif pensé pour les présentations de classe.",
    duration: "1 h 10",
    topic: "Soft skills · Communication",
    access: "premium",
  },
  {
    type: "podcast",
    title: "Choisir sa filière après le Bac sciences",
    description:
      "Panorama des grandes familles d'études scientifiques au Maroc : classes préparatoires, licences, écoles d'ingénieurs — et comment trancher.",
    duration: "32 min",
    topic: "Orientation · Sciences",
    access: "free",
  },
  {
    type: "podcast",
    title: "Le rituel du dimanche : planifier sa semaine",
    description:
      "Un épisode pratique pour installer une routine de planification simple, durable et adaptée au rythme d'un étudiant.",
    duration: "25 min",
    topic: "Soft skills · Gestion du temps",
    access: "free",
  },
  {
    type: "ebook",
    title: "Guide pratique après le Bac : filières et alternatives",
    description:
      "Comment comparer des filières, lire une offre de formation et préparer un dossier solide — avec des checklists à cocher étape par étape.",
    duration: "60 pages",
    topic: "Orientation · Post-Bac",
    access: "premium",
  },
  {
    type: "ebook",
    title: "Mini-guide : construire sa première roadmap d'orientation",
    description:
      "Transformer un objectif flou (« réussir ») en plan daté et réaliste, avec des jalons mesurables et des points d'étape mensuels.",
    duration: "20 pages",
    topic: "Orientation · Méthode",
    access: "free",
  },
  {
    type: "podcast",
    title: "Travail en équipe : réussir un projet de groupe",
    description:
      "Répartir les rôles, gérer les désaccords et livrer à temps — les codes du travail d'équipe expliqués avec des exemples scolaires.",
    duration: "28 min",
    topic: "Soft skills · Collaboration",
    access: "premium",
  },
  {
    type: "cours",
    title: "Organiser ses révisions avant les examens",
    description:
      "Prioriser les matières, découper les sessions et éviter le bachotage : une méthode de préparation saine et répérable.",
    duration: "50 min",
    topic: "Soft skills · Organisation",
    access: "premium",
  },
];
