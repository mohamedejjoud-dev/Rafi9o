/**
 * Rafi9i — Mock data + localStorage-backed mock backend (Developer 2)
 * ---------------------------------------------------------------------
 * Mirrors the FINAL API contract (Laravel + Sanctum) so pages never change
 * when switching to live mode. All data is clearly demonstration content:
 * the UI shows a "Mode démo" badge while this layer is active.
 *
 * Localization: every catalog is a locale-independent skeleton (ids, scores,
 * emojis, option values) + per-locale text bundles (fr, en, ar, ary). The
 * current UI language is read with `getStoredLocale()` at call time, and the
 * exported catalogs (`FIELDS_CATALOG`, `BASIC_QUESTIONS`…) resolve to the
 * current language whenever they are read. Ids, keys and shapes are
 * identical in every locale. Stored demo results are re-localized on read.
 *
 * NOTE: no secrets here — mock passwords are base64 demo values only.
 */
import {
  AdminSubscriber,
  AdminSubscriberList,
  ApiError,
  AssessmentQuestion,
  AssessmentSession,
  AuthResponse,
  DashboardData,
  FieldMatch,
  LatestResult,
  LearningResource,
  LoginPayload,
  OrientationResult,
  ProfileUpdatePayload,
  RegisterPayload,
  RoadmapStep,
  SoftSkillPriority,
  SubscriptionStatus,
  TrialStatus,
  UserProfile,
} from "./types";
import { getStoredLocale, translate, type Locale, type TranslationVars } from "./i18n";

/* ------------------------------------------------------------------ */
/* localStorage helpers                                                */
/* ------------------------------------------------------------------ */

export const MOCK_KEYS = {
  users: "rafi9i.users",
  session: "rafi9i.session",
  results: "rafi9i.results",
  trial: "rafi9i.trial",
  resourceProgress: "rafi9i.progress.resources",
  roadmapProgress: "rafi9i.progress.roadmap",
  streak: "rafi9i.progress.streak",
  aiFailure: "rafi9i.simulate.ai-failure",
  adminSubscribers: "rafi9i.admin.subscribers",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — ignore in demo */
  }
}

function readSessionUser(): UserProfile | null {
  const session = read<{ user: UserProfile } | null>(MOCK_KEYS.session, null);
  return session?.user ?? null;
}

/* ------------------------------------------------------------------ */
/* Localization helpers                                                */
/* ------------------------------------------------------------------ */

/** Translate a content key in the current UI language. */
function tr(key: string, vars?: TranslationVars): string {
  return translate(getStoredLocale(), key, vars);
}

/**
 * An array that always reflects the current UI language: every read
 * (index, length, map, find, spread…) is forwarded to the list built for
 * `getStoredLocale()`. Lists are built once per locale and cached.
 */
function localizedList<T extends object>(build: (locale: Locale) => T[]): T[] {
  const cache = new Map<Locale, T[]>();
  const current = (): T[] => {
    const locale = getStoredLocale();
    let list = cache.get(locale);
    if (!list) {
      list = build(locale);
      cache.set(locale, list);
    }
    return list;
  };
  return new Proxy([] as T[], {
    get(_target, prop) {
      const list = current();
      const value = Reflect.get(list, prop, list) as unknown;
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(list) : value;
    },
    has: (_target, prop) => Reflect.has(current(), prop),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_target, prop) => Reflect.getOwnPropertyDescriptor(current(), prop),
  });
}

/* ------------------------------------------------------------------ */
/* Locale-independent skeletons                                        */
/* ------------------------------------------------------------------ */

/** 5 academic fields (Moroccan context): id + base display score. */
const FIELD_SKELETON: { id: string; score: number }[] = [
  { id: "informatique-data", score: 82 },
  { id: "ingenierie", score: 74 },
  { id: "medecine-sante", score: 71 },
  { id: "commerce-gestion", score: 68 },
  { id: "droit-sciences-po", score: 63 },
];

/** 8 soft skills. */
const SOFT_SKILL_SKELETON: { id: string; currentLevel: number }[] = [
  { id: "communication-orale", currentLevel: 55 },
  { id: "gestion-du-temps", currentLevel: 62 },
  { id: "gestion-du-stress", currentLevel: 66 },
  { id: "pensee-critique", currentLevel: 72 },
  { id: "travail-equipe", currentLevel: 74 },
  { id: "adaptabilite", currentLevel: 70 },
  { id: "leadership", currentLevel: 58 },
  { id: "creativite", currentLevel: 76 },
];

/** 10 learning resources. */
const RESOURCE_SKELETON: Pick<LearningResource, "id" | "type">[] = [
  { id: "res-python-oc", type: "course" },
  { id: "res-web-coursera", type: "course" },
  { id: "res-maths-fun", type: "course" },
  { id: "res-data-alx", type: "course" },
  { id: "res-podcast-orientation", type: "podcast" },
  { id: "res-podcast-tech", type: "podcast" },
  { id: "res-podcast-methodes", type: "podcast" },
  { id: "res-ebook-filieres", type: "ebook" },
  { id: "res-ebook-apprendre", type: "ebook" },
  { id: "res-ebook-confiance", type: "ebook" },
];

/** Roadmap: 8 steps / 4 stages. */
const ROADMAP_SKELETON: Pick<RoadmapStep, "id" | "stage">[] = [
  { id: "rm-explore-1", stage: "explore" },
  { id: "rm-explore-2", stage: "explore" },
  { id: "rm-learn-1", stage: "learn" },
  { id: "rm-learn-2", stage: "learn" },
  { id: "rm-practice-1", stage: "practice" },
  { id: "rm-practice-2", stage: "practice" },
  { id: "rm-prepare-1", stage: "prepare" },
  { id: "rm-prepare-2", stage: "prepare" },
];

type QuestionSkeleton = {
  id: string;
  type: AssessmentQuestion["type"];
  required: boolean;
  maxSelections?: number;
  options?: { value: string; emoji?: string }[];
  scale?: { min: number; max: number };
};

/** Basic assessment (12 questions). */
const BASIC_SKELETON: QuestionSkeleton[] = [
  {
    id: "bacStream", type: "single", required: true,
    options: [
      { value: "sciences-math", emoji: "📐" },
      { value: "sciences-experimentales", emoji: "🔬" },
      { value: "sciences-economiques", emoji: "📊" },
      { value: "lettres-sciences-humaines", emoji: "📚" },
      { value: "sciences-techniques", emoji: "⚙️" },
      { value: "autre", emoji: "🎒" },
    ],
  },
  {
    id: "academicStrengths", type: "multi", maxSelections: 4, required: true,
    options: [
      { value: "logique-math", emoji: "🧮" },
      { value: "memoire", emoji: "🧠" },
      { value: "redaction", emoji: "✍️" },
      { value: "experimentation", emoji: "⚗️" },
      { value: "organisation", emoji: "🗂️" },
      { value: "creativite", emoji: "💡" },
    ],
  },
  {
    id: "favouriteSubjects", type: "multi", maxSelections: 5, required: true,
    options: [
      { value: "maths", emoji: "➗" },
      { value: "physique-chimie", emoji: "🧪" },
      { value: "svt", emoji: "🌱" },
      { value: "informatique", emoji: "💻" },
      { value: "francais", emoji: "🇫🇷" },
      { value: "histoire-geo", emoji: "🌍" },
      { value: "philosophie", emoji: "🦉" },
      { value: "economie", emoji: "📈" },
      { value: "langues", emoji: "🗣️" },
      { value: "arts", emoji: "🎨" },
    ],
  },
  {
    id: "interests", type: "multi", maxSelections: 5, required: true,
    options: [
      { value: "technologie", emoji: "🤖" },
      { value: "sante", emoji: "🩺" },
      { value: "business", emoji: "🚀" },
      { value: "droit-justice", emoji: "⚖️" },
      { value: "sciences", emoji: "🔭" },
      { value: "culture", emoji: "🎭" },
      { value: "environnement", emoji: "🌍" },
      { value: "art", emoji: "🎬" },
    ],
  },
  {
    id: "preferredActivities", type: "multi", maxSelections: 4, required: true,
    options: [
      { value: "resoudre-problemes", emoji: "🧩" },
      { value: "experimenter", emoji: "🧫" },
      { value: "debattre", emoji: "💬" },
      { value: "creer", emoji: "🛠️" },
      { value: "aider", emoji: "🤝" },
      { value: "organiser", emoji: "📋" },
    ],
  },
  {
    id: "workPreference", type: "single", required: true,
    options: [
      { value: "bureau-structure", emoji: "🏢" },
      { value: "terrain-varie", emoji: "🚗" },
      { value: "laboratoire", emoji: "🔬" },
      { value: "liberte-remote", emoji: "🏝️" },
      { value: "contact-client", emoji: "🧑‍🤝‍🧑" },
    ],
  },
  {
    id: "city", type: "single", required: true,
    options: [
      { value: "casablanca", emoji: "🌊" },
      { value: "rabat", emoji: "🏛️" },
      { value: "marrakech", emoji: "🌴" },
      { value: "fes", emoji: "🕌" },
      { value: "tanger", emoji: "⛴️" },
      { value: "agadir", emoji: "🏖️" },
      { value: "autre", emoji: "📍" },
      { value: "peu-importe", emoji: "🧭" },
    ],
  },
  {
    id: "studyType", type: "single", required: true,
    options: [
      { value: "public", emoji: "🎓" },
      { value: "prive", emoji: "🏫" },
      { value: "indifferent", emoji: "🤷" },
    ],
  },
  {
    id: "budget", type: "single", required: true,
    options: [
      { value: "budget-0-5000", emoji: "🪙" },
      { value: "budget-5000-20000", emoji: "💵" },
      { value: "budget-20000-40000", emoji: "💰" },
      { value: "budget-40000-plus", emoji: "🏆" },
    ],
  },
  {
    id: "careerInterests", type: "multi", maxSelections: 5, required: true,
    options: [
      { value: "informatique", emoji: "💻" },
      { value: "data", emoji: "📊" },
      { value: "ingenierie", emoji: "🏗️" },
      { value: "sante", emoji: "⚕️" },
      { value: "commerce", emoji: "🛍️" },
      { value: "finance", emoji: "🏦" },
      { value: "droit", emoji: "⚖️" },
      { value: "enseignement", emoji: "🎓" },
      { value: "communication", emoji: "📣" },
      { value: "entrepreneur", emoji: "🚀" },
    ],
  },
  { id: "confidence", type: "scale", required: true, scale: { min: 1, max: 5 } },
  {
    id: "mainDifficulty", type: "single", required: true,
    options: [
      { value: "orientation-floue", emoji: "🌫️" },
      { value: "information-manquante", emoji: "❓" },
      { value: "pression-familiale", emoji: "👨‍👩‍👧" },
      { value: "moyens-financiers", emoji: "💸" },
      { value: "manque-confiance", emoji: "😔" },
      { value: "motivation", emoji: "⏰" },
    ],
  },
];

/** Advanced assessment (10 questions). */
const ADVANCED_SKELETON: QuestionSkeleton[] = [
  {
    id: "workEnvironment", type: "single", required: true,
    options: [
      { value: "startup", emoji: "⚡" },
      { value: "grande-entreprise", emoji: "🏢" },
      { value: "secteur-public", emoji: "🏛️" },
      { value: "cabinet-liberal", emoji: "🩺" },
      { value: "recherche", emoji: "🔬" },
      { value: "entreprendre", emoji: "👑" },
    ],
  },
  {
    id: "learningStyle", type: "single", required: true,
    options: [
      { value: "pratique", emoji: "🛠️" },
      { value: "theorique", emoji: "📖" },
      { value: "equilibre", emoji: "⚖️" },
    ],
  },
  {
    id: "workMode", type: "single", required: true,
    options: [
      { value: "autonome", emoji: "🧑‍💻" },
      { value: "collaboratif", emoji: "👥" },
      { value: "equilibre", emoji: "🔄" },
    ],
  },
  { id: "leadershipComfort", type: "scale", required: true, scale: { min: 1, max: 5 } },
  { id: "communicationConfidence", type: "scale", required: true, scale: { min: 1, max: 5 } },
  {
    id: "mobility", type: "single", required: true,
    options: [
      { value: "ma-ville", emoji: "🏠" },
      { value: "maroc", emoji: "🗺️" },
      { value: "international", emoji: "✈️" },
      { value: "remote", emoji: "🌐" },
    ],
  },
  {
    id: "financialConstraint", type: "single", required: true,
    options: [
      { value: "aucune", emoji: "🟢" },
      { value: "partielle", emoji: "🟡" },
      { value: "forte", emoji: "🔴" },
    ],
  },
  {
    id: "careerPriority", type: "single", required: true,
    options: [
      { value: "salaire", emoji: "💵" },
      { value: "stabilite", emoji: "🛡️" },
      { value: "passion", emoji: "❤️" },
      { value: "impact", emoji: "🌱" },
      { value: "equilibre", emoji: "🌿" },
    ],
  },
  {
    id: "longTermGoal", type: "single", required: true,
    options: [
      { value: "expert", emoji: "🎯" },
      { value: "direction", emoji: "📊" },
      { value: "entreprendre", emoji: "🚀" },
      { value: "contribuer", emoji: "🏗️" },
      { value: "flexible", emoji: "🕊️" },
    ],
  },
  {
    id: "mainObstacle", type: "single", required: true,
    options: [
      { value: "confiance", emoji: "🌧️" },
      { value: "finances", emoji: "💰" },
      { value: "info", emoji: "🧭" },
      { value: "famille", emoji: "👨‍👩‍👧" },
      { value: "procrastination", emoji: "⏳" },
      { value: "autre", emoji: "🔹" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Per-locale text bundles                                             */
/* ------------------------------------------------------------------ */

type FieldText = Pick<FieldMatch, "name" | "explanation" | "strengths" | "potentialChallenges" | "nextAction">;
type SkillText = Pick<SoftSkillPriority, "name" | "reason" | "action">;
type ResourceText = Pick<LearningResource, "title" | "description" | "duration">;
type RoadmapText = Pick<RoadmapStep, "title" | "description">;
type QuestionText = {
  question: string;
  helper?: string;
  /** option value → label */
  options?: Record<string, string>;
  minLabel?: string;
  maxLabel?: string;
};

interface ContentBundle {
  fields: Record<string, FieldText>;
  skills: Record<string, SkillText>;
  resources: Record<string, ResourceText>;
  roadmap: Record<string, RoadmapText>;
  questions: Record<string, QuestionText>;
}

const TEXT_FR: ContentBundle = {
  fields: {
    "informatique-data": {
      name: "Informatique & Data",
      explanation:
        "Ton profil montre une vraie aisance avec la logique, les maths et la résolution de problèmes. Les métiers du numérique (développement, data, IA) sont en forte croissance au Maroc, avec des écoles d'excellence comme l'ENSIAS, les ENSA, 1337 ou ALX, et des salaires parmi les plus attractifs du marché.",
      strengths: [
        "Rigueur logique et goût pour la résolution de problèmes",
        "Curiosité technologique et autonomie d'apprentissage",
        "Bonnes bases scientifiques (maths, physique)",
      ],
      potentialChallenges: [
        "Volume important de travail pratique en première année",
        "Anglais technique à consolider rapidement",
        "Concurrence élevée dans les écoles les plus demandées",
      ],
      nextAction:
        "Explore le programme de l'ENSIAS ou d'une ENSA proche de chez toi, et commence un cours d'initiation Python cette semaine.",
    },
    ingenierie: {
      name: "Ingénierie & Sciences appliquées",
      explanation:
        "Ton goût pour l'expérimentation et les sciences appliquées correspond bien au parcours d'ingénieur (CPGE, ENSA, FST). Ce domaine ouvre des carrières variées : génie civil, mécanique, électrique, énergies renouvelables — un secteur porteur avec les grands projets d'infrastructure au Maroc.",
      strengths: [
        "Solides bases en sciences physiques et mathématiques",
        "Esprit pratique et goût de l'expérimentation",
        "Persévérance face aux problèmes complexes",
      ],
      potentialChallenges: [
        "Cursus exigeant (classes préparatoires ou concours CNC)",
        "Charge de travail élevée sur les deux premières années",
        "Nécessité de bien choisir ta spécialité en fin de parcours",
      ],
      nextAction:
        "Compare les programmes CPGE / ENSA / FST et assiste à une journée portes ouvertes pour parler à des étudiants.",
    },
    "medecine-sante": {
      name: "Médecine & Santé",
      explanation:
        "Ton intérêt pour les sciences du vivant et ton envie d'aider les autres pointent vers les études de santé (FMP, instituts infirmiers, pharmacie, dentaire). C'est un parcours long mais très structurant, avec une vraie demande de professionnels au Maroc.",
      strengths: [
        "Bonne mémorisation et rigueur scientifique",
        "Empathie et envie d'impact direct sur les personnes",
        "Capacité de travail régulier sur la durée",
      ],
      potentialChallenges: [
        "Concours d'entrée très sélectif (médecine)",
        "Durée des études (6 à 10 ans selon la spécialité)",
        "Gestion du stress pendant les périodes d'examens",
      ],
      nextAction:
        "Renseigne-toi sur les conditions d'accès à la faculté de médecine de ta ville et sur les filières paramédicales alternatives.",
    },
    "commerce-gestion": {
      name: "Commerce & Gestion (ENCG)",
      explanation:
        "Ton énergie relationnelle, ton intérêt pour l'économie et ton esprit d'initiative correspondent bien aux ENCG, aux écoles de commerce privées et aux filières gestion des universités. Le Maroc a besoin de managers formés au marketing, à la finance et à l'entrepreneuriat.",
      strengths: [
        "Facilité de communication et travail en équipe",
        "Intérêt pour l'économie et l'actualité des affaires",
        "Esprit d'initiative et d'organisation",
      ],
      potentialChallenges: [
        "Concours TAFEM à bien préparer pour les ENCG",
        "Frais élevés dans certaines écoles privées",
        "Stages à multiplier pour se différencier",
      ],
      nextAction:
        "Prépare le concours TAFEM et découvre les spécialités ENCG (marketing, finance, achats) via des témoignages d'étudiants.",
    },
    "droit-sciences-po": {
      name: "Droit & Sciences politiques",
      explanation:
        "Ton aisance à l'écrit, ton goût du débat et ton intérêt pour la société correspondent aux filières droit (université) et sciences politiques (Rabat, Tanger, Ifrane). Débouchés : avocat, notaire, juriste d'entreprise, administration publique, organisations internationales.",
      strengths: [
        "Qualités rédactionnelles et argumentation",
        "Culture générale et curiosité pour l'actualité",
        "Capacité d'analyse de situations complexes",
      ],
      potentialChallenges: [
        "Amphis chargés en première année de droit",
        "Mémorisation intensive (codes, jurisprudence)",
        "Concours administratifs compétitifs en sortie",
      ],
      nextAction:
        "Assiste à un cours ouvert en fac de droit et lis un arrêt commenté pour tester ton intérêt réel pour la matière.",
    },
  },
  skills: {
    "communication-orale": {
      name: "Communication orale",
      reason:
        "Presque toutes les filières qui te correspondent incluent des soutenances et des présentations. Renforcer ta communication orale multiplie ton impact dès la première année.",
      action: "Présente en 3 minutes un sujet qui te passionne devant un proche, une fois par semaine.",
    },
    "gestion-du-temps": {
      name: "Gestion du temps",
      reason:
        "Les cursus sélectifs (CPGE, médecine, écoles d'ingénieurs) demandent un rythme soutenu. Une méthode de travail solide fait la différence dès le bac.",
      action: "Planifie chaque dimanche ta semaine avec 3 priorités par jour, et fais le bilan le vendredi.",
    },
    "gestion-du-stress": {
      name: "Gestion du stress",
      reason:
        "Concours et examens créent des pics de pression. Apprendre à réguler ton stress protège tes performances et ta motivation.",
      action: "Essaie la respiration 4-7-8 avant chaque devoir pendant deux semaines.",
    },
    "pensee-critique": {
      name: "Pensée critique",
      reason:
        "Savoir évaluer une information, une source ou un argument t'aidera dans les études comme dans tes choix d'orientation.",
      action: "Analyse un article d'actualité par semaine : quelle est la source ? Que manque-t-il ?",
    },
    "travail-equipe": {
      name: "Travail d'équipe",
      reason:
        "Projets de classe, hackathons, travaux de groupe : la collaboration est au cœur des études supérieures modernes.",
      action: "Prends le rôle d'organisateur dans ton prochain travail de groupe.",
    },
    adaptabilite: {
      name: "Adaptabilité",
      reason:
        "Ton parcours va te réserver des changements (ville, méthode d'apprentissage, nouveaux rythmes). L'adaptabilité réduit le coût de chaque transition.",
      action: "Change une habitude d'étude pendant une semaine et note ce que tu apprends.",
    },
    leadership: {
      name: "Leadership",
      reason:
        "Tu as des aptitudes naturelles à organiser. Les développer t'ouvrira des responsabilités dans les clubs étudiants et plus tard en entreprise.",
      action: "Propose d'animer une révision collective ou un événement dans ton lycée ce mois-ci.",
    },
    creativite: {
      name: "Créativité",
      reason:
        "Ta capacité à proposer des idées neuves est un atout différenciant, notamment en informatique et en entrepreneuriat.",
      action: "Tiens un carnet d'idées : note 3 idées par jour, même farfelues.",
    },
  },
  resources: {
    "res-python-oc": {
      title: "Fondamentaux de Python",
      description:
        "Cours d'initiation idéal avant une école d'informatique : variables, boucles, fonctions et premier mini-projet.",
      duration: "20 h · OpenClassrooms",
    },
    "res-web-coursera": {
      title: "Introduction au développement web",
      description:
        "HTML, CSS et JavaScript : construis ta première page personnelle et comprends le métier de développeur front-end.",
      duration: "30 h · Coursera",
    },
    "res-maths-fun": {
      title: "Mathématiques : logique et raisonnement",
      description:
        "Remets à niveau logique, ensembles et algèbre — la base demandée en CPGE, ENSA et écoles d'informatique.",
      duration: "25 h · FUN MOOC",
    },
    "res-data-alx": {
      title: "Initiation à la data science",
      description:
        "Découvre ce que font les data analysts : Excel, premiers graphiques, statistiques descriptives et cas pratiques.",
      duration: "40 h · ALX / Coursera",
    },
    "res-podcast-orientation": {
      title: "Génération Orientation",
      description:
        "Podcast marocain : des étudiants racontent leur parcours (ENCG, médecine, écoles d'ingénieurs) et leurs conseils.",
      duration: "25 min / épisode",
    },
    "res-podcast-tech": {
      title: "Les coulisses des métiers tech",
      description:
        "Développeurs, data analysts et product managers racontent une journée type de leur métier au Maroc et à l'étranger.",
      duration: "35 min / épisode",
    },
    "res-podcast-methodes": {
      title: "Méthodes d'apprentissage efficaces",
      description:
        "Techniques concrètes de mémorisation, de prise de notes et de révision, applicables dès cette semaine.",
      duration: "20 min / épisode",
    },
    "res-ebook-filieres": {
      title: "Guide des filières scientifiques au Maroc",
      description:
        "Panorama clair : CPGE, ENSA, FST, ENSIAS, médecine — admission, contenu, débouchés et témoignages.",
      duration: "60 pages · PDF",
    },
    "res-ebook-apprendre": {
      title: "Apprendre à apprendre",
      description:
        "E-book pratique sur la concentration, le plan de révision et la mémoire : parfait avant la rentrée dans le supérieur.",
      duration: "45 pages · PDF",
    },
    "res-ebook-confiance": {
      title: "Prendre confiance en sa prise de parole",
      description:
        "Exercices progressifs pour parler en public sans stress : utile pour les soutenances et les oraux de concours.",
      duration: "30 pages · PDF",
    },
  },
  roadmap: {
    "rm-explore-1": {
      title: "Rencontre un étudiant du domaine",
      description: "Identifie un étudiant en informatique ou en école d'ingénieurs (famille, lycée, LinkedIn) et pose-lui 5 questions.",
    },
    "rm-explore-2": {
      title: "Assiste à une journée portes ouvertes",
      description: "Note les dates des JPO des écoles visées (ENSIAS, ENSA, FST, ENCG) et prépare 3 questions à poser.",
    },
    "rm-learn-1": {
      title: "Termine un cours d'initiation",
      description: "Choisis le cours Python ou développement web dans tes ressources et termine le premier module.",
    },
    "rm-learn-2": {
      title: "Renforce tes maths fondamentales",
      description: "Consolide logique, algèbre et trigonométrie : elles servent dans toutes les filières scientifiques visées.",
    },
    "rm-practice-1": {
      title: "Réalise un mini-projet",
      description: "Crée un petit projet concret : page web personnelle, script utile ou exposé présenté à ta classe.",
    },
    "rm-practice-2": {
      title: "Rejoins un club ou un hackathon",
      description: "Club de robotique, de sciences, de débat ou hackathon local : l'expérience collective compte autant que les notes.",
    },
    "rm-prepare-1": {
      title: "Prépare ton dossier de candidature",
      description: "Rassemble relevés de notes, CV simple et lettre de motivation type pour tes candidatures.",
    },
    "rm-prepare-2": {
      title: "Étudie les concours d'entrée",
      description: "CNC, TAFEM, concours ENSIAS/ENSA : calendrier, épreuves et annales à télécharger.",
    },
  },
  questions: {
    bacStream: {
      question: "Quelle est ta filière au baccalauréat ?",
      helper: "Cela nous aide à connaître tes bases académiques.",
      options: {
        "sciences-math": "Sciences Mathématiques",
        "sciences-experimentales": "Sciences Expérimentales",
        "sciences-economiques": "Sciences Économiques",
        "lettres-sciences-humaines": "Lettres & Sciences humaines",
        "sciences-techniques": "Sciences & Technologies",
        autre: "Autre situation",
      },
    },
    academicStrengths: {
      question: "Quels sont tes points forts académiques ?",
      helper: "Choisis jusqu'à 4 réponses.",
      options: {
        "logique-math": "Logique & calcul",
        memoire: "Mémoire & restitution",
        redaction: "Rédaction & analyse",
        experimentation: "Expérimentation",
        organisation: "Organisation & méthode",
        creativite: "Créativité & imagination",
      },
    },
    favouriteSubjects: {
      question: "Quelles sont tes matières préférées ?",
      helper: "Choisis jusqu'à 5 matières.",
      options: {
        maths: "Mathématiques",
        "physique-chimie": "Physique-chimie",
        svt: "SVT",
        informatique: "Informatique",
        francais: "Français",
        "histoire-geo": "Histoire-géographie",
        philosophie: "Philosophie",
        economie: "Économie",
        langues: "Langues étrangères",
        arts: "Arts & design",
      },
    },
    interests: {
      question: "Quels sujets te passionnent en dehors des cours ?",
      helper: "Choisis jusqu'à 5 centres d'intérêt.",
      options: {
        technologie: "Technologie & numérique",
        sante: "Santé & bien-être",
        business: "Business & entrepreneuriat",
        "droit-justice": "Droit & justice",
        sciences: "Sciences & innovation",
        culture: "Culture & communication",
        environnement: "Environnement",
        art: "Art & création",
      },
    },
    preferredActivities: {
      question: "Qu'est-ce que tu préfères faire concrètement ?",
      helper: "Choisis jusqu'à 4 activités.",
      options: {
        "resoudre-problemes": "Résoudre des problèmes",
        experimenter: "Expérimenter & manipuler",
        debattre: "Débattre & convaincre",
        creer: "Créer des choses",
        aider: "Aider les autres",
        organiser: "Organiser & coordonner",
      },
    },
    workPreference: {
      question: "Dans quel cadre te vois-tu travailler ?",
      options: {
        "bureau-structure": "Un bureau structuré, des procédures claires",
        "terrain-varie": "Sur le terrain, des journées variées",
        laboratoire: "Un laboratoire ou un atelier",
        "liberte-remote": "De la liberté, voire du télétravail",
        "contact-client": "Au contact des clients ou patients",
      },
    },
    city: {
      question: "Dans quelle ville souhaites-tu étudier ?",
      helper: "Rafi en tiendra compte dans ses recommandations d'écoles.",
      options: {
        casablanca: "Casablanca",
        rabat: "Rabat",
        marrakech: "Marrakech",
        fes: "Fès",
        tanger: "Tanger",
        agadir: "Agadir",
        autre: "Une autre ville",
        "peu-importe": "Peu importe / flexible",
      },
    },
    studyType: {
      question: "Plutôt établissement public ou privé ?",
      options: { public: "Public", prive: "Privé", indifferent: "Les deux me conviennent" },
    },
    budget: {
      question: "Quel est ton budget annuel approximatif pour les études ?",
      helper: "Frais de scolarité, hors logement et transport.",
      options: {
        "budget-0-5000": "Moins de 5 000 DH/an",
        "budget-5000-20000": "5 000 – 20 000 DH/an",
        "budget-20000-40000": "20 000 – 40 000 DH/an",
        "budget-40000-plus": "Plus de 40 000 DH/an",
      },
    },
    careerInterests: {
      question: "Quels domaines professionnels t'attirent aujourd'hui ?",
      helper: "Choisis jusqu'à 5 domaines — même si ce n'est pas encore clair.",
      options: {
        informatique: "Informatique / développement",
        data: "Data & IA",
        ingenierie: "Ingénierie",
        sante: "Médecine / santé",
        commerce: "Commerce / marketing",
        finance: "Finance / gestion",
        droit: "Droit",
        enseignement: "Enseignement",
        communication: "Communication / médias",
        entrepreneur: "Entrepreneuriat",
      },
    },
    confidence: {
      question: "À quel point te sens-tu clair sur ta direction académique ?",
      minLabel: "Complètement perdu(e)",
      maxLabel: "Très clair",
    },
    mainDifficulty: {
      question: "Quelle est ta difficulté principale en ce moment ?",
      options: {
        "orientation-floue": "Je ne sais pas quoi choisir",
        "information-manquante": "Je manque d'informations fiables",
        "pression-familiale": "Pression familiale ou sociale",
        "moyens-financiers": "Moyens financiers limités",
        "manque-confiance": "Manque de confiance en moi",
        motivation: "Motivation & organisation",
      },
    },
    workEnvironment: {
      question: "Dans quel environnement travailles-tu le mieux ?",
      options: {
        startup: "Une startup dynamique",
        "grande-entreprise": "Une grande entreprise structurée",
        "secteur-public": "Le secteur public / administratif",
        "cabinet-liberal": "Un cabinet libéral / une clinique",
        recherche: "La recherche et les laboratoires",
        entreprendre: "Entreprendre, être mon propre patron",
      },
    },
    learningStyle: {
      question: "Comment apprends-tu le mieux ?",
      options: {
        pratique: "En pratiquant, les mains dans le cambouis",
        theorique: "Avec des concepts, des théories solides",
        equilibre: "Les deux, selon les matières",
      },
    },
    workMode: {
      question: "Tu préfères travailler seul ou en équipe ?",
      options: {
        autonome: "En autonomie, à mon rythme",
        collaboratif: "En équipe, avec de l'énergie collective",
        equilibre: "Un mélange des deux",
      },
    },
    leadershipComfort: {
      question: "À quel point es-tu à l'aise pour prendre les commandes d'un groupe ?",
      minLabel: "Je préfère suivre",
      maxLabel: "J'aime diriger",
    },
    communicationConfidence: {
      question: "À quel point es-tu à l'aise pour parler en public ?",
      minLabel: "Très réservé(e)",
      maxLabel: "Très à l'aise",
    },
    mobility: {
      question: "Es-tu prêt(e) à t'éloigner de chez toi pour tes études ou ton travail ?",
      options: {
        "ma-ville": "Rester dans ma ville",
        maroc: "Bouger au Maroc, sans problème",
        international: "Viser l'international",
        remote: "Travailler à distance",
      },
    },
    financialConstraint: {
      question: "Quelle est ta situation financière pour les études ?",
      helper: "Rafi adapte ses recommandations d'écoles et de bourses.",
      options: {
        aucune: "Aucune contrainte majeure",
        partielle: "Contrainte partielle — il faut optimiser",
        forte: "Forte — bourses et frais réduits essentiels",
      },
    },
    careerPriority: {
      question: "Quelle est ta priorité numéro un dans ta future carrière ?",
      options: {
        salaire: "Un bon salaire rapidement",
        stabilite: "Stabilité et sécurité",
        passion: "Faire ce que j'aime",
        impact: "Avoir un impact positif",
        equilibre: "Équilibre vie pro / vie perso",
      },
    },
    longTermGoal: {
      question: "Où te vois-tu dans 10 ans ?",
      options: {
        expert: "Expert reconnu dans mon domaine",
        direction: "À la direction d'une équipe ou d'une entreprise",
        entreprendre: "Fondateur / fondatrice de ma propre structure",
        contribuer: "Contribuer à de grands projets (pays, ONG, recherche)",
        flexible: "Gagner en liberté et en flexibilité",
      },
    },
    mainObstacle: {
      question: "Quel est ton plus grand obstacle personnel aujourd'hui ?",
      helper: "Sois honnête : Rafi adapte son accompagnement à ta réponse.",
      options: {
        confiance: "Le manque de confiance en moi",
        finances: "Les contraintes financières",
        info: "Le manque d'information et d'accompagnement",
        famille: "La pression familiale",
        procrastination: "La procrastination / l'organisation",
        autre: "Autre chose",
      },
    },
  },
};

const TEXT_EN: ContentBundle = {
  fields: {
    "informatique-data": {
      name: "Computer Science & Data",
      explanation:
        "Your profile shows real ease with logic, math and problem solving. Digital careers (software development, data, AI) are growing fast in Morocco, with top schools such as ENSIAS, the ENSA network, 1337 or ALX, and some of the most attractive salaries on the market.",
      strengths: [
        "Logical rigor and a taste for problem solving",
        "Curiosity about technology and independent learning",
        "Solid scientific foundations (math, physics)",
      ],
      potentialChallenges: [
        "A heavy load of hands-on work in the first year",
        "Technical English to strengthen quickly",
        "Strong competition for the most popular schools",
      ],
      nextAction:
        "Explore the ENSIAS program or an ENSA near you, and start an introductory Python course this week.",
    },
    ingenierie: {
      name: "Engineering & Applied Sciences",
      explanation:
        "Your taste for experimentation and applied sciences fits the engineering path well (CPGE, ENSA, FST). This field opens up varied careers: civil, mechanical and electrical engineering, renewable energy — a growing sector driven by Morocco's major infrastructure projects.",
      strengths: [
        "Solid foundations in physics and mathematics",
        "Practical mindset and a taste for experimentation",
        "Perseverance when facing complex problems",
      ],
      potentialChallenges: [
        "A demanding path (preparatory classes or the CNC exam)",
        "A heavy workload during the first two years",
        "Choosing the right specialization at the end of your studies",
      ],
      nextAction:
        "Compare the CPGE / ENSA / FST programs and attend an open day to talk with current students.",
    },
    "medecine-sante": {
      name: "Medicine & Health",
      explanation:
        "Your interest in life sciences and your wish to help others point toward health studies (FMP, nursing institutes, pharmacy, dentistry). It's a long path but a very structuring one, with real demand for health professionals in Morocco.",
      strengths: [
        "Good memory and scientific rigor",
        "Empathy and a wish to directly help people",
        "Ability to work steadily over the long run",
      ],
      potentialChallenges: [
        "A very selective entrance exam (medicine)",
        "Length of studies (6 to 10 years depending on the specialty)",
        "Managing stress during exam periods",
      ],
      nextAction:
        "Look up the admission requirements of the faculty of medicine in your city, and alternative paramedical programs.",
    },
    "commerce-gestion": {
      name: "Business & Management (ENCG)",
      explanation:
        "Your people skills, your interest in economics and your initiative fit the ENCG schools, private business schools and university management programs well. Morocco needs managers trained in marketing, finance and entrepreneurship.",
      strengths: [
        "Ease with communication and teamwork",
        "Interest in economics and business news",
        "Initiative and a sense of organization",
      ],
      potentialChallenges: [
        "The TAFEM exam to prepare well for the ENCG schools",
        "High fees at some private schools",
        "Internships to multiply to stand out",
      ],
      nextAction:
        "Prepare for the TAFEM exam and discover the ENCG specializations (marketing, finance, purchasing) through student testimonials.",
    },
    "droit-sciences-po": {
      name: "Law & Political Science",
      explanation:
        "Your ease with writing, your taste for debate and your interest in society match law programs (university) and political science (Rabat, Tangier, Ifrane). Career paths: lawyer, notary, corporate legal counsel, public administration, international organizations.",
      strengths: [
        "Writing and argumentation skills",
        "General knowledge and curiosity about current affairs",
        "Ability to analyze complex situations",
      ],
      potentialChallenges: [
        "Crowded lecture halls in the first year of law",
        "Intensive memorization (codes, case law)",
        "Competitive civil-service exams after graduation",
      ],
      nextAction:
        "Attend an open lecture at a law faculty and read a commented court ruling to test your real interest in the subject.",
    },
  },
  skills: {
    "communication-orale": {
      name: "Public speaking",
      reason:
        "Almost every program that suits you includes oral defenses and presentations. Strengthening your speaking skills multiplies your impact from the very first year.",
      action: "Once a week, present a topic you love in 3 minutes to someone close to you.",
    },
    "gestion-du-temps": {
      name: "Time management",
      reason:
        "Selective programs (CPGE, medicine, engineering schools) demand a steady pace. A solid work method makes the difference from the Bac onward.",
      action: "Every Sunday, plan your week with 3 priorities per day, and review it on Friday.",
    },
    "gestion-du-stress": {
      name: "Stress management",
      reason:
        "Entrance exams and tests create pressure peaks. Learning to regulate your stress protects your performance and your motivation.",
      action: "Try 4-7-8 breathing before every test for two weeks.",
    },
    "pensee-critique": {
      name: "Critical thinking",
      reason:
        "Knowing how to assess a piece of information, a source or an argument will help you in your studies as well as in your orientation choices.",
      action: "Analyze one news article a week: what is the source? What is missing?",
    },
    "travail-equipe": {
      name: "Teamwork",
      reason:
        "Class projects, hackathons, group work: collaboration is at the heart of modern higher education.",
      action: "Take on the organizer role in your next group project.",
    },
    adaptabilite: {
      name: "Adaptability",
      reason:
        "Your path will bring changes (city, learning methods, new rhythms). Adaptability lowers the cost of every transition.",
      action: "Change one study habit for a week and write down what you learn.",
    },
    leadership: {
      name: "Leadership",
      reason:
        "You have a natural talent for organizing. Developing it will open up responsibilities in student clubs and later at work.",
      action: "Offer to lead a group revision session or an event at your high school this month.",
    },
    creativite: {
      name: "Creativity",
      reason:
        "Your ability to come up with new ideas sets you apart, especially in computer science and entrepreneurship.",
      action: "Keep an idea notebook: write down 3 ideas a day, even wild ones.",
    },
  },
  resources: {
    "res-python-oc": {
      title: "Python fundamentals",
      description:
        "An ideal introductory course before a computer science school: variables, loops, functions and a first mini-project.",
      duration: "20 h · OpenClassrooms",
    },
    "res-web-coursera": {
      title: "Introduction to web development",
      description:
        "HTML, CSS and JavaScript: build your first personal page and understand the front-end developer's job.",
      duration: "30 h · Coursera",
    },
    "res-maths-fun": {
      title: "Mathematics: logic and reasoning",
      description:
        "Brush up on logic, sets and algebra — the foundation expected in CPGE, ENSA and computer science schools.",
      duration: "25 h · FUN MOOC",
    },
    "res-data-alx": {
      title: "Introduction to data science",
      description:
        "Discover what data analysts do: Excel, first charts, descriptive statistics and case studies.",
      duration: "40 h · ALX / Coursera",
    },
    "res-podcast-orientation": {
      title: "Génération Orientation",
      description:
        "A Moroccan podcast: students share their journeys (ENCG, medicine, engineering schools) and their advice.",
      duration: "25 min / episode",
    },
    "res-podcast-tech": {
      title: "Behind the scenes of tech jobs",
      description:
        "Developers, data analysts and product managers describe a typical day in their job in Morocco and abroad.",
      duration: "35 min / episode",
    },
    "res-podcast-methodes": {
      title: "Effective learning methods",
      description:
        "Concrete techniques for memorizing, taking notes and revising that you can apply this very week.",
      duration: "20 min / episode",
    },
    "res-ebook-filieres": {
      title: "Guide to science programs in Morocco",
      description:
        "A clear overview: CPGE, ENSA, FST, ENSIAS, medicine — admission, content, career paths and testimonials.",
      duration: "60 pages · PDF",
    },
    "res-ebook-apprendre": {
      title: "Learning how to learn",
      description:
        "A practical e-book on focus, revision planning and memory: perfect before starting higher education.",
      duration: "45 pages · PDF",
    },
    "res-ebook-confiance": {
      title: "Gaining confidence when speaking",
      description:
        "Progressive exercises to speak in public without stress: useful for oral defenses and entrance interviews.",
      duration: "30 pages · PDF",
    },
  },
  roadmap: {
    "rm-explore-1": {
      title: "Meet a student in the field",
      description: "Find a computer science or engineering student (family, high school, LinkedIn) and ask them 5 questions.",
    },
    "rm-explore-2": {
      title: "Attend an open day",
      description: "Note the open-day dates of your target schools (ENSIAS, ENSA, FST, ENCG) and prepare 3 questions to ask.",
    },
    "rm-learn-1": {
      title: "Finish an introductory course",
      description: "Pick the Python or web development course in your resources and finish the first module.",
    },
    "rm-learn-2": {
      title: "Strengthen your core math",
      description: "Consolidate logic, algebra and trigonometry: they are used in every science program you are aiming for.",
    },
    "rm-practice-1": {
      title: "Build a mini-project",
      description: "Create a small, concrete project: a personal web page, a useful script or a talk presented to your class.",
    },
    "rm-practice-2": {
      title: "Join a club or a hackathon",
      description: "Robotics, science or debate club, or a local hackathon: group experience counts as much as grades.",
    },
    "rm-prepare-1": {
      title: "Prepare your application file",
      description: "Gather your transcripts, a simple CV and a template cover letter for your applications.",
    },
    "rm-prepare-2": {
      title: "Study the entrance exams",
      description: "CNC, TAFEM, ENSIAS/ENSA exams: calendar, tests and past papers to download.",
    },
  },
  questions: {
    bacStream: {
      question: "What is your Bac stream?",
      helper: "This helps us understand your academic background.",
      options: {
        "sciences-math": "Mathematical Sciences",
        "sciences-experimentales": "Experimental Sciences",
        "sciences-economiques": "Economic Sciences",
        "lettres-sciences-humaines": "Humanities & Social Sciences",
        "sciences-techniques": "Science & Technology",
        autre: "Other situation",
      },
    },
    academicStrengths: {
      question: "What are your academic strengths?",
      helper: "Choose up to 4 answers.",
      options: {
        "logique-math": "Logic & calculation",
        memoire: "Memory & recall",
        redaction: "Writing & analysis",
        experimentation: "Experimentation",
        organisation: "Organization & method",
        creativite: "Creativity & imagination",
      },
    },
    favouriteSubjects: {
      question: "What are your favorite subjects?",
      helper: "Choose up to 5 subjects.",
      options: {
        maths: "Mathematics",
        "physique-chimie": "Physics-chemistry",
        svt: "Life & Earth Sciences",
        informatique: "Computer science",
        francais: "French",
        "histoire-geo": "History-geography",
        philosophie: "Philosophy",
        economie: "Economics",
        langues: "Foreign languages",
        arts: "Arts & design",
      },
    },
    interests: {
      question: "Which topics excite you outside of class?",
      helper: "Choose up to 5 interests.",
      options: {
        technologie: "Technology & digital",
        sante: "Health & well-being",
        business: "Business & entrepreneurship",
        "droit-justice": "Law & justice",
        sciences: "Science & innovation",
        culture: "Culture & communication",
        environnement: "Environment",
        art: "Art & creation",
      },
    },
    preferredActivities: {
      question: "What do you prefer doing in practice?",
      helper: "Choose up to 4 activities.",
      options: {
        "resoudre-problemes": "Solving problems",
        experimenter: "Experimenting & building",
        debattre: "Debating & persuading",
        creer: "Creating things",
        aider: "Helping others",
        organiser: "Organizing & coordinating",
      },
    },
    workPreference: {
      question: "In what setting do you see yourself working?",
      options: {
        "bureau-structure": "A structured office with clear procedures",
        "terrain-varie": "In the field, with varied days",
        laboratoire: "A laboratory or a workshop",
        "liberte-remote": "Freedom, maybe even remote work",
        "contact-client": "In contact with clients or patients",
      },
    },
    city: {
      question: "In which city would you like to study?",
      helper: "Rafi will take it into account in school recommendations.",
      options: {
        casablanca: "Casablanca",
        rabat: "Rabat",
        marrakech: "Marrakech",
        fes: "Fez",
        tanger: "Tangier",
        agadir: "Agadir",
        autre: "Another city",
        "peu-importe": "Doesn't matter / flexible",
      },
    },
    studyType: {
      question: "Public or private institution?",
      options: { public: "Public", prive: "Private", indifferent: "Both work for me" },
    },
    budget: {
      question: "What is your approximate yearly budget for your studies?",
      helper: "Tuition fees, excluding housing and transport.",
      options: {
        "budget-0-5000": "Less than 5,000 DH/year",
        "budget-5000-20000": "5,000 – 20,000 DH/year",
        "budget-20000-40000": "20,000 – 40,000 DH/year",
        "budget-40000-plus": "More than 40,000 DH/year",
      },
    },
    careerInterests: {
      question: "Which professional fields attract you today?",
      helper: "Choose up to 5 fields — even if it's not clear yet.",
      options: {
        informatique: "Computer science / development",
        data: "Data & AI",
        ingenierie: "Engineering",
        sante: "Medicine / health",
        commerce: "Business / marketing",
        finance: "Finance / management",
        droit: "Law",
        enseignement: "Teaching",
        communication: "Communication / media",
        entrepreneur: "Entrepreneurship",
      },
    },
    confidence: {
      question: "How clear do you feel about your academic direction?",
      minLabel: "Completely lost",
      maxLabel: "Very clear",
    },
    mainDifficulty: {
      question: "What is your main difficulty right now?",
      options: {
        "orientation-floue": "I don't know what to choose",
        "information-manquante": "I lack reliable information",
        "pression-familiale": "Family or social pressure",
        "moyens-financiers": "Limited financial means",
        "manque-confiance": "Lack of self-confidence",
        motivation: "Motivation & organization",
      },
    },
    workEnvironment: {
      question: "In which environment do you work best?",
      options: {
        startup: "A dynamic startup",
        "grande-entreprise": "A large, structured company",
        "secteur-public": "The public / administrative sector",
        "cabinet-liberal": "A private practice / a clinic",
        recherche: "Research and laboratories",
        entreprendre: "Starting my own business, being my own boss",
      },
    },
    learningStyle: {
      question: "How do you learn best?",
      options: {
        pratique: "By doing, hands-on",
        theorique: "With concepts and solid theories",
        equilibre: "Both, depending on the subject",
      },
    },
    workMode: {
      question: "Do you prefer working alone or in a team?",
      options: {
        autonome: "Independently, at my own pace",
        collaboratif: "In a team, with group energy",
        equilibre: "A mix of both",
      },
    },
    leadershipComfort: {
      question: "How comfortable are you taking charge of a group?",
      minLabel: "I prefer to follow",
      maxLabel: "I like to lead",
    },
    communicationConfidence: {
      question: "How comfortable are you speaking in public?",
      minLabel: "Very reserved",
      maxLabel: "Very comfortable",
    },
    mobility: {
      question: "Are you ready to move away from home for your studies or work?",
      options: {
        "ma-ville": "Stay in my city",
        maroc: "Move within Morocco, no problem",
        international: "Aim for abroad",
        remote: "Work remotely",
      },
    },
    financialConstraint: {
      question: "What is your financial situation for your studies?",
      helper: "Rafi adapts its school and scholarship recommendations.",
      options: {
        aucune: "No major constraint",
        partielle: "Partial constraint — I need to optimize",
        forte: "Strong — scholarships and low fees are essential",
      },
    },
    careerPriority: {
      question: "What is your number one priority in your future career?",
      options: {
        salaire: "A good salary quickly",
        stabilite: "Stability and security",
        passion: "Doing what I love",
        impact: "Having a positive impact",
        equilibre: "Work-life balance",
      },
    },
    longTermGoal: {
      question: "Where do you see yourself in 10 years?",
      options: {
        expert: "A recognized expert in my field",
        direction: "Leading a team or a company",
        entreprendre: "Founder of my own organization",
        contribuer: "Contributing to major projects (country, NGOs, research)",
        flexible: "Gaining freedom and flexibility",
      },
    },
    mainObstacle: {
      question: "What is your biggest personal obstacle today?",
      helper: "Be honest: Rafi adapts its support to your answer.",
      options: {
        confiance: "Lack of self-confidence",
        finances: "Financial constraints",
        info: "Lack of information and guidance",
        famille: "Family pressure",
        procrastination: "Procrastination / organization",
        autre: "Something else",
      },
    },
  },
};

const TEXT_AR: ContentBundle = {
  fields: {
    "informatique-data": {
      name: "المعلوميات والبيانات",
      explanation:
        "يُظهر ملفك سهولة حقيقية في المنطق والرياضيات وحل المشكلات. مهن الرقمنة (البرمجة، البيانات، الذكاء الاصطناعي) تعرف نمواً قوياً في المغرب، مع مدارس متميزة مثل ENSIAS وشبكة ENSA و1337 وALX، وأجور من بين الأكثر جاذبية في سوق الشغل.",
      strengths: [
        "دقة منطقية وميل إلى حل المشكلات",
        "فضول تكنولوجي وقدرة على التعلّم الذاتي",
        "أسس علمية جيدة (الرياضيات، الفيزياء)",
      ],
      potentialChallenges: [
        "حجم كبير من العمل التطبيقي في السنة الأولى",
        "ضرورة تقوية الإنجليزية التقنية بسرعة",
        "منافسة قوية على المدارس الأكثر طلباً",
      ],
      nextAction:
        "اطّلع على برنامج ENSIAS أو مدرسة ENSA قريبة منك، وابدأ هذا الأسبوع دورة تمهيدية في Python.",
    },
    ingenierie: {
      name: "الهندسة والعلوم التطبيقية",
      explanation:
        "ميلك إلى التجريب والعلوم التطبيقية يتوافق جيداً مع مسار المهندس (CPGE، ENSA، FST). يفتح هذا المجال مهناً متنوعة: الهندسة المدنية والميكانيكية والكهربائية والطاقات المتجددة — قطاع واعد بفضل المشاريع الكبرى للبنية التحتية في المغرب.",
      strengths: [
        "أسس متينة في العلوم الفيزيائية والرياضيات",
        "عقلية عملية وميل إلى التجريب",
        "مثابرة أمام المشكلات المعقّدة",
      ],
      potentialChallenges: [
        "مسار متطلّب (الأقسام التحضيرية أو مباراة CNC)",
        "ضغط عمل كبير خلال السنتين الأوليين",
        "ضرورة حسن اختيار التخصص في نهاية المسار",
      ],
      nextAction:
        "قارن بين برامج CPGE وENSA وFST، واحضر يوماً مفتوحاً للتحدث مع الطلبة.",
    },
    "medecine-sante": {
      name: "الطب والصحة",
      explanation:
        "اهتمامك بعلوم الحياة ورغبتك في مساعدة الآخرين يوجّهانك نحو دراسات الصحة (كليات الطب والصيدلة، معاهد التمريض، طب الأسنان). إنه مسار طويل لكنه يبني الشخصية، مع طلب حقيقي على مهنيي الصحة في المغرب.",
      strengths: [
        "قدرة جيدة على الحفظ ودقة علمية",
        "تعاطف ورغبة في التأثير المباشر في حياة الناس",
        "قدرة على العمل المنتظم على المدى الطويل",
      ],
      potentialChallenges: [
        "مباراة ولوج انتقائية جداً (الطب)",
        "طول مدة الدراسة (من 6 إلى 10 سنوات حسب التخصص)",
        "التحكم في التوتر خلال فترات الامتحانات",
      ],
      nextAction:
        "استعلم عن شروط الولوج إلى كلية الطب في مدينتك وعن مسارات شبه الطبية البديلة.",
    },
    "commerce-gestion": {
      name: "التجارة والتسيير (ENCG)",
      explanation:
        "حسّك في التواصل واهتمامك بالاقتصاد وروح المبادرة لديك تتوافق جيداً مع مدارس ENCG ومدارس التجارة الخاصة ومسالك التسيير في الجامعات. يحتاج المغرب إلى مسيّرين مكوَّنين في التسويق والمالية وريادة الأعمال.",
      strengths: [
        "سهولة في التواصل والعمل الجماعي",
        "اهتمام بالاقتصاد وأخبار عالم الأعمال",
        "روح المبادرة وحسّ التنظيم",
      ],
      potentialChallenges: [
        "مباراة TAFEM التي تتطلب تحضيراً جيداً لولوج ENCG",
        "رسوم مرتفعة في بعض المدارس الخاصة",
        "ضرورة مضاعفة التداريب للتميّز",
      ],
      nextAction:
        "حضّر لمباراة TAFEM واكتشف تخصصات ENCG (التسويق، المالية، المشتريات) من خلال شهادات الطلبة.",
    },
    "droit-sciences-po": {
      name: "القانون والعلوم السياسية",
      explanation:
        "سهولة الكتابة لديك وحبك للنقاش واهتمامك بالمجتمع تتوافق مع مسالك الحقوق (الجامعة) والعلوم السياسية (الرباط، طنجة، إفران). آفاق الشغل: محامٍ، موثّق، مستشار قانوني في المقاولات، الإدارة العمومية، المنظمات الدولية.",
      strengths: [
        "مهارات في التحرير والحجاج",
        "ثقافة عامة وفضول تجاه الأحداث الجارية",
        "قدرة على تحليل الوضعيات المعقّدة",
      ],
      potentialChallenges: [
        "مدرّجات مكتظة في السنة الأولى من الحقوق",
        "حفظ مكثف (القوانين، الاجتهاد القضائي)",
        "مباريات إدارية تنافسية بعد التخرج",
      ],
      nextAction:
        "احضر محاضرة مفتوحة في كلية الحقوق واقرأ قراراً قضائياً مع تعليق عليه لتختبر اهتمامك الحقيقي بالمادة.",
    },
  },
  skills: {
    "communication-orale": {
      name: "التواصل الشفهي",
      reason:
        "تتضمن جل المسالك التي تناسبك عروضاً ومناقشات. تقوية تواصلك الشفهي تضاعف أثرك منذ السنة الأولى.",
      action: "قدّم مرة في الأسبوع، في 3 دقائق، موضوعاً تحبه أمام أحد المقرّبين منك.",
    },
    "gestion-du-temps": {
      name: "تدبير الوقت",
      reason:
        "المسالك الانتقائية (CPGE، الطب، مدارس المهندسين) تتطلب إيقاعاً مرتفعاً. منهجية عمل متينة تصنع الفرق منذ الباكالوريا.",
      action: "خطّط كل يوم أحد لأسبوعك بـ3 أولويات في اليوم، وقيّم حصيلتك يوم الجمعة.",
    },
    "gestion-du-stress": {
      name: "التحكم في التوتر",
      reason:
        "المباريات والامتحانات تخلق لحظات ضغط قوية. تعلّم التحكم في توترك يحمي أداءك وحماسك.",
      action: "جرّب تقنية التنفس 4-7-8 قبل كل فرض لمدة أسبوعين.",
    },
    "pensee-critique": {
      name: "التفكير النقدي",
      reason:
        "القدرة على تقييم معلومة أو مصدر أو حجة ستساعدك في دراستك كما في اختياراتك للتوجيه.",
      action: "حلّل مقالاً إخبارياً كل أسبوع: ما هو المصدر؟ وما الذي ينقصه؟",
    },
    "travail-equipe": {
      name: "العمل الجماعي",
      reason:
        "مشاريع القسم، الهاكاثونات، الأعمال الجماعية: التعاون في صميم الدراسات العليا الحديثة.",
      action: "تولَّ دور المنظّم في عملك الجماعي القادم.",
    },
    adaptabilite: {
      name: "القدرة على التكيّف",
      reason:
        "سيحمل لك مسارك تغييرات (مدينة جديدة، طرق تعلّم مختلفة، إيقاعات جديدة). القدرة على التكيّف تخفف كلفة كل انتقال.",
      action: "غيّر عادة دراسية واحدة لمدة أسبوع ودوّن ما تتعلّمه.",
    },
    leadership: {
      name: "القيادة",
      reason:
        "لديك قدرات طبيعية على التنظيم. تطويرها سيفتح لك مسؤوليات في الأندية الطلابية ثم لاحقاً في المقاولة.",
      action: "اقترح هذا الشهر تنشيط مراجعة جماعية أو نشاط في ثانويتك.",
    },
    creativite: {
      name: "الإبداع",
      reason:
        "قدرتك على اقتراح أفكار جديدة ميزة تميّزك، خصوصاً في المعلوميات وريادة الأعمال.",
      action: "خصّص دفتراً للأفكار: دوّن 3 أفكار يومياً، حتى الغريبة منها.",
    },
  },
  resources: {
    "res-python-oc": {
      title: "أساسيات Python",
      description:
        "دورة تمهيدية مثالية قبل مدرسة للمعلوميات: المتغيرات، الحلقات، الدوال وأول مشروع صغير.",
      duration: "20 ساعة · OpenClassrooms",
    },
    "res-web-coursera": {
      title: "مدخل إلى تطوير الويب",
      description:
        "HTML وCSS وJavaScript: أنشئ صفحتك الشخصية الأولى وافهم مهنة مطوّر الواجهات.",
      duration: "30 ساعة · Coursera",
    },
    "res-maths-fun": {
      title: "الرياضيات: المنطق والاستدلال",
      description:
        "راجع المنطق والمجموعات والجبر — الأساس المطلوب في CPGE وENSA ومدارس المعلوميات.",
      duration: "25 ساعة · FUN MOOC",
    },
    "res-data-alx": {
      title: "مدخل إلى علم البيانات",
      description:
        "اكتشف عمل محلّلي البيانات: Excel، أولى الرسوم البيانية، الإحصاء الوصفي ودراسات حالة.",
      duration: "40 ساعة · ALX / Coursera",
    },
    "res-podcast-orientation": {
      title: "Génération Orientation",
      description:
        "بودكاست مغربي: طلبة يحكون عن مساراتهم (ENCG، الطب، مدارس المهندسين) ويقدّمون نصائحهم.",
      duration: "25 دقيقة / حلقة",
    },
    "res-podcast-tech": {
      title: "كواليس مهن التكنولوجيا",
      description:
        "مطوّرون ومحلّلو بيانات ومديرو منتجات يحكون عن يوم عمل نموذجي في المغرب وخارجه.",
      duration: "35 دقيقة / حلقة",
    },
    "res-podcast-methodes": {
      title: "طرق تعلّم فعّالة",
      description:
        "تقنيات عملية للحفظ وتدوين الملاحظات والمراجعة، يمكن تطبيقها ابتداءً من هذا الأسبوع.",
      duration: "20 دقيقة / حلقة",
    },
    "res-ebook-filieres": {
      title: "دليل المسالك العلمية في المغرب",
      description:
        "نظرة واضحة: CPGE وENSA وFST وENSIAS والطب — شروط الولوج، المحتوى، آفاق الشغل والشهادات.",
      duration: "60 صفحة · PDF",
    },
    "res-ebook-apprendre": {
      title: "تعلّم كيف تتعلّم",
      description:
        "كتاب إلكتروني عملي حول التركيز وخطة المراجعة والذاكرة: مثالي قبل الالتحاق بالتعليم العالي.",
      duration: "45 صفحة · PDF",
    },
    "res-ebook-confiance": {
      title: "اكتسب الثقة في التحدث أمام الآخرين",
      description:
        "تمارين تدريجية للتحدث أمام الجمهور دون توتر: مفيدة للمناقشات والاختبارات الشفهية في المباريات.",
      duration: "30 صفحة · PDF",
    },
  },
  roadmap: {
    "rm-explore-1": {
      title: "التقِ بطالب من المجال",
      description: "ابحث عن طالب في المعلوميات أو في مدرسة للمهندسين (العائلة، الثانوية، LinkedIn) واطرح عليه 5 أسئلة.",
    },
    "rm-explore-2": {
      title: "احضر يوماً مفتوحاً",
      description: "دوّن مواعيد الأيام المفتوحة للمدارس التي تستهدفها (ENSIAS، ENSA، FST، ENCG) وحضّر 3 أسئلة.",
    },
    "rm-learn-1": {
      title: "أكمل دورة تمهيدية",
      description: "اختر دورة Python أو تطوير الويب من مواردك وأكمل الوحدة الأولى.",
    },
    "rm-learn-2": {
      title: "قوِّ أساسياتك في الرياضيات",
      description: "عزّز المنطق والجبر وحساب المثلثات: فهي مطلوبة في جميع المسالك العلمية التي تستهدفها.",
    },
    "rm-practice-1": {
      title: "أنجز مشروعاً صغيراً",
      description: "أنشئ مشروعاً صغيراً وملموساً: صفحة ويب شخصية، أو برنامجاً مفيداً، أو عرضاً تقدّمه لقسمك.",
    },
    "rm-practice-2": {
      title: "انضم إلى نادٍ أو هاكاثون",
      description: "نادي الروبوتيك أو العلوم أو المناظرة أو هاكاثون محلي: التجربة الجماعية مهمة بقدر النقط.",
    },
    "rm-prepare-1": {
      title: "حضّر ملف ترشيحك",
      description: "اجمع كشوف النقط وسيرة ذاتية بسيطة ورسالة تحفيز نموذجية لترشيحاتك.",
    },
    "rm-prepare-2": {
      title: "ادرس مباريات الولوج",
      description: "CNC وTAFEM ومباريات ENSIAS/ENSA: الجدول الزمني، الاختبارات والامتحانات السابقة للتحميل.",
    },
  },
  questions: {
    bacStream: {
      question: "ما هي شعبتك في الباكالوريا؟",
      helper: "يساعدنا ذلك على معرفة أسسك الأكاديمية.",
      options: {
        "sciences-math": "العلوم الرياضية",
        "sciences-experimentales": "العلوم التجريبية",
        "sciences-economiques": "العلوم الاقتصادية",
        "lettres-sciences-humaines": "الآداب والعلوم الإنسانية",
        "sciences-techniques": "العلوم والتكنولوجيات",
        autre: "وضعية أخرى",
      },
    },
    academicStrengths: {
      question: "ما هي نقاط قوتك الأكاديمية؟",
      helper: "اختر حتى 4 إجابات.",
      options: {
        "logique-math": "المنطق والحساب",
        memoire: "الحفظ والاسترجاع",
        redaction: "التحرير والتحليل",
        experimentation: "التجريب",
        organisation: "التنظيم والمنهجية",
        creativite: "الإبداع والخيال",
      },
    },
    favouriteSubjects: {
      question: "ما هي موادك المفضلة؟",
      helper: "اختر حتى 5 مواد.",
      options: {
        maths: "الرياضيات",
        "physique-chimie": "الفيزياء والكيمياء",
        svt: "علوم الحياة والأرض",
        informatique: "المعلوميات",
        francais: "الفرنسية",
        "histoire-geo": "التاريخ والجغرافيا",
        philosophie: "الفلسفة",
        economie: "الاقتصاد",
        langues: "اللغات الأجنبية",
        arts: "الفنون والتصميم",
      },
    },
    interests: {
      question: "ما هي المواضيع التي تشغفك خارج الدراسة؟",
      helper: "اختر حتى 5 اهتمامات.",
      options: {
        technologie: "التكنولوجيا والرقمنة",
        sante: "الصحة والرفاهية",
        business: "الأعمال وريادة المقاولات",
        "droit-justice": "القانون والعدالة",
        sciences: "العلوم والابتكار",
        culture: "الثقافة والتواصل",
        environnement: "البيئة",
        art: "الفن والإبداع",
      },
    },
    preferredActivities: {
      question: "ماذا تفضّل أن تفعل عملياً؟",
      helper: "اختر حتى 4 أنشطة.",
      options: {
        "resoudre-problemes": "حل المشكلات",
        experimenter: "التجريب والتطبيق اليدوي",
        debattre: "النقاش والإقناع",
        creer: "صنع الأشياء",
        aider: "مساعدة الآخرين",
        organiser: "التنظيم والتنسيق",
      },
    },
    workPreference: {
      question: "في أي إطار ترى نفسك تعمل؟",
      options: {
        "bureau-structure": "مكتب منظّم بإجراءات واضحة",
        "terrain-varie": "في الميدان، بأيام متنوعة",
        laboratoire: "مختبر أو ورشة",
        "liberte-remote": "حرية، وربما العمل عن بُعد",
        "contact-client": "في تواصل مع الزبناء أو المرضى",
      },
    },
    city: {
      question: "في أي مدينة ترغب في الدراسة؟",
      helper: "سيأخذ رافي ذلك بعين الاعتبار في توصياته للمدارس.",
      options: {
        casablanca: "الدار البيضاء",
        rabat: "الرباط",
        marrakech: "مراكش",
        fes: "فاس",
        tanger: "طنجة",
        agadir: "أكادير",
        autre: "مدينة أخرى",
        "peu-importe": "لا يهم / مرن",
      },
    },
    studyType: {
      question: "مؤسسة عمومية أم خاصة؟",
      options: { public: "عمومية", prive: "خاصة", indifferent: "كلاهما يناسبني" },
    },
    budget: {
      question: "ما هي ميزانيتك السنوية التقريبية للدراسة؟",
      helper: "رسوم التمدرس، دون احتساب السكن والنقل.",
      options: {
        "budget-0-5000": "أقل من 5000 درهم/سنة",
        "budget-5000-20000": "5000 – 20000 درهم/سنة",
        "budget-20000-40000": "20000 – 40000 درهم/سنة",
        "budget-40000-plus": "أكثر من 40000 درهم/سنة",
      },
    },
    careerInterests: {
      question: "ما هي المجالات المهنية التي تجذبك اليوم؟",
      helper: "اختر حتى 5 مجالات — حتى لو لم تتضح الصورة بعد.",
      options: {
        informatique: "المعلوميات / البرمجة",
        data: "البيانات والذكاء الاصطناعي",
        ingenierie: "الهندسة",
        sante: "الطب / الصحة",
        commerce: "التجارة / التسويق",
        finance: "المالية / التسيير",
        droit: "القانون",
        enseignement: "التعليم",
        communication: "التواصل / الإعلام",
        entrepreneur: "ريادة الأعمال",
      },
    },
    confidence: {
      question: "إلى أي حد تشعر بوضوح اتجاهك الأكاديمي؟",
      minLabel: "تائه(ة) تماماً",
      maxLabel: "واضح جداً",
    },
    mainDifficulty: {
      question: "ما هي صعوبتك الرئيسية حالياً؟",
      options: {
        "orientation-floue": "لا أعرف ماذا أختار",
        "information-manquante": "تنقصني معلومات موثوقة",
        "pression-familiale": "ضغط عائلي أو اجتماعي",
        "moyens-financiers": "إمكانيات مادية محدودة",
        "manque-confiance": "نقص الثقة في النفس",
        motivation: "الحماس والتنظيم",
      },
    },
    workEnvironment: {
      question: "في أي بيئة تعمل بشكل أفضل؟",
      options: {
        startup: "شركة ناشئة ديناميكية",
        "grande-entreprise": "مقاولة كبيرة ومنظّمة",
        "secteur-public": "القطاع العام / الإداري",
        "cabinet-liberal": "مكتب مهني حر / مصحة",
        recherche: "البحث العلمي والمختبرات",
        entreprendre: "إنشاء مشروعي الخاص، أن أكون رئيس نفسي",
      },
    },
    learningStyle: {
      question: "كيف تتعلّم بشكل أفضل؟",
      options: {
        pratique: "بالممارسة والتطبيق الفعلي",
        theorique: "بالمفاهيم والنظريات المتينة",
        equilibre: "الاثنان معاً، حسب المادة",
      },
    },
    workMode: {
      question: "هل تفضّل العمل وحدك أم ضمن فريق؟",
      options: {
        autonome: "باستقلالية، وفق إيقاعي",
        collaboratif: "ضمن فريق، بطاقة جماعية",
        equilibre: "مزيج من الاثنين",
      },
    },
    leadershipComfort: {
      question: "إلى أي حد تشعر بالارتياح لقيادة مجموعة؟",
      minLabel: "أفضّل أن أتبع",
      maxLabel: "أحب القيادة",
    },
    communicationConfidence: {
      question: "إلى أي حد تشعر بالارتياح للتحدث أمام الجمهور؟",
      minLabel: "متحفّظ(ة) جداً",
      maxLabel: "مرتاح(ة) جداً",
    },
    mobility: {
      question: "هل أنت مستعد(ة) للابتعاد عن بيتك من أجل الدراسة أو العمل؟",
      options: {
        "ma-ville": "البقاء في مدينتي",
        maroc: "التنقل داخل المغرب، دون مشكل",
        international: "التوجه نحو الخارج",
        remote: "العمل عن بُعد",
      },
    },
    financialConstraint: {
      question: "ما هي وضعيتك المادية بالنسبة للدراسة؟",
      helper: "يكيّف رافي توصياته للمدارس والمنح.",
      options: {
        aucune: "لا توجد قيود كبيرة",
        partielle: "قيود جزئية — يجب الترشيد",
        forte: "قيود قوية — المنح والرسوم المنخفضة ضرورية",
      },
    },
    careerPriority: {
      question: "ما هي أولويتك الأولى في مسارك المهني المستقبلي؟",
      options: {
        salaire: "أجر جيد بسرعة",
        stabilite: "الاستقرار والأمان",
        passion: "القيام بما أحب",
        impact: "إحداث أثر إيجابي",
        equilibre: "التوازن بين الحياة المهنية والشخصية",
      },
    },
    longTermGoal: {
      question: "أين ترى نفسك بعد 10 سنوات؟",
      options: {
        expert: "خبير(ة) معترف به في مجالي",
        direction: "على رأس فريق أو مقاولة",
        entreprendre: "مؤسس(ة) مشروعي الخاص",
        contribuer: "المساهمة في مشاريع كبرى (الوطن، المنظمات غير الحكومية، البحث)",
        flexible: "كسب المزيد من الحرية والمرونة",
      },
    },
    mainObstacle: {
      question: "ما هو أكبر عائق شخصي لديك اليوم؟",
      helper: "كن صادقاً: يكيّف رافي مرافقته حسب إجابتك.",
      options: {
        confiance: "نقص الثقة في النفس",
        finances: "القيود المادية",
        info: "نقص المعلومات والمواكبة",
        famille: "الضغط العائلي",
        procrastination: "التسويف / التنظيم",
        autre: "شيء آخر",
      },
    },
  },
};

const TEXT_ARY: ContentBundle = {
  fields: {
    "informatique-data": {
      name: "المعلوميات والداتا",
      explanation:
        "البروفيل ديالك كيبين بلي كتعرف تتعامل مزيان مع المنطق، الماط وحل المشاكل. المهن ديال الرقمي (البرمجة، الداتا، الذكاء الاصطناعي) كتكبر بزاف فالمغرب، وكاينين مدارس واعرين بحال ENSIAS، شبكة ENSA، 1337 ولا ALX، والخلصة فيها من أحسن الخلصات فالسوق.",
      strengths: [
        "دقة فالمنطق وكتبغي تحل المشاكل",
        "فضول على التكنولوجيا وكتعرف تتعلم بوحدك",
        "أساس علمي مزيان (الماط، الفيزيك)",
      ],
      potentialChallenges: [
        "بزاف ديال الخدمة التطبيقية فالعام الأول",
        "خاصك تقوي النجليزية التقنية بالزربة",
        "منافسة كبيرة على المدارس اللي مطلوبين بزاف",
      ],
      nextAction:
        "شوف البرنامج ديال ENSIAS ولا شي ENSA قريبة ليك، وبدا هاد السيمانة كورس ديال المبتدئين فـPython.",
    },
    ingenierie: {
      name: "الهندسة والعلوم التطبيقية",
      explanation:
        "الميول ديالك للتجريب والعلوم التطبيقية كيتناسب مزيان مع الطريق ديال المهندس (CPGE، ENSA، FST). هاد المجال كيحل ليك بزاف ديال المهن: الهندسة المدنية، الميكانيك، الكهرباء، الطاقات المتجددة — قطاع عندو مستقبل مع المشاريع الكبار ديال البنية التحتية فالمغرب.",
      strengths: [
        "أساس قوي فالفيزيك والماط",
        "عقلية عملية وكتبغي تجرب",
        "كتصبر قدام المشاكل الصعيبة",
      ],
      potentialChallenges: [
        "طريق صعيب شوية (الأقسام التحضيرية ولا كونكور CNC)",
        "بزاف ديال الخدمة فالعامين الأولين",
        "خاصك تختار التخصص ديالك مزيان فاللخر",
      ],
      nextAction:
        "قارن بين البرامج ديال CPGE وENSA وFST، ومشي لشي يوم مفتوح باش تهضر مع الطلبة.",
    },
    "medecine-sante": {
      name: "الطب والصحة",
      explanation:
        "الاهتمام ديالك بعلوم الحياة والرغبة ديالك باش تعاون الناس كيوجهوك لقراية الصحة (كليات الطب والصيدلة، معاهد التمريض، طب السنان). طريق طويلة ولكن كتبني الشخصية، والمغرب محتاج بزاف ديال الناس فالصحة.",
      strengths: [
        "كتحفظ مزيان وعندك دقة علمية",
        "حنين وبغيتي تأثر مباشرة فحياة الناس",
        "كتقدر تخدم بانتظام مدة طويلة",
      ],
      potentialChallenges: [
        "كونكور ديال الدخول صعيب بزاف (الطب)",
        "القراية طويلة (من 6 حتى 10 سنين على حساب التخصص)",
        "خاصك تتحكم فالستريس فوقت الامتحانات",
      ],
      nextAction:
        "سول على الشروط ديال الدخول لكلية الطب فالمدينة ديالك، وعلى الشعب شبه الطبية كبديل.",
    },
    "commerce-gestion": {
      name: "التجارة والتسيير (ENCG)",
      explanation:
        "الطاقة ديالك مع الناس، الاهتمام ديالك بالاقتصاد وروح المبادرة كيتناسبو مزيان مع ENCG، مدارس التجارة الخاصة والشعب ديال التسيير فالجامعات. المغرب محتاج مسيرين مكونين فالماركتينغ، المالية وريادة الأعمال.",
      strengths: [
        "كتعرف تتواصل وتخدم مع الجماعة",
        "مهتم بالاقتصاد والأخبار ديال البيزنس",
        "عندك روح المبادرة والتنظيم",
      ],
      potentialChallenges: [
        "كونكور TAFEM خاصو تحضير مزيان باش تدخل ENCG",
        "الثمن غالي فشي مدارس خاصة",
        "خاصك تدير بزاف ديال الستاجات باش تبان",
      ],
      nextAction:
        "وجد راسك لكونكور TAFEM واكتشف التخصصات ديال ENCG (الماركتينغ، المالية، المشتريات) من الشهادات ديال الطلبة.",
    },
    "droit-sciences-po": {
      name: "الحقوق والعلوم السياسية",
      explanation:
        "كتعرف تكتب مزيان، كتبغي النقاش ومهتم بالمجتمع، وهادشي كيتناسب مع الحقوق (الجامعة) والعلوم السياسية (الرباط، طنجة، إفران). الخدمة من بعد: محامي، موثق، مستشار قانوني فشركة، الإدارة العمومية، المنظمات الدولية.",
      strengths: [
        "كتعرف تكتب وتقنع بالحجة",
        "ثقافة عامة وفضول على الأخبار",
        "كتعرف تحلل الوضعيات المعقدة",
      ],
      potentialChallenges: [
        "الأمفيات عامرين فالعام الأول ديال الحقوق",
        "بزاف ديال الحفظ (القوانين، الاجتهاد القضائي)",
        "كونكورات الإدارة فيهم منافسة كبيرة من بعد",
      ],
      nextAction:
        "حضر شي محاضرة مفتوحة فكلية الحقوق وقرا شي حكم مع التعليق ديالو باش تشوف واش بصح كتعجبك المادة.",
    },
  },
  skills: {
    "communication-orale": {
      name: "التواصل الشفوي",
      reason:
        "تقريباً كاع الشعب اللي كيناسبوك فيهم عروض ومناقشات. إلا قويتي التواصل الشفوي ديالك، غادي يكبر التأثير ديالك من العام الأول.",
      action: "مرة فالسيمانة، قدم فـ3 دقايق موضوع كيعجبك قدام شي واحد قريب ليك.",
    },
    "gestion-du-temps": {
      name: "تنظيم الوقت",
      reason:
        "الشعب الصعيبة (CPGE، الطب، مدارس المهندسين) كتطلب إيقاع قوي. طريقة خدمة مزيانة كتفرق من الباك.",
      action: "كل نهار الحد، نظم السيمانة ديالك بـ3 أولويات فالنهار، وشوف الحصيلة نهار الجمعة.",
    },
    "gestion-du-stress": {
      name: "التحكم فالستريس",
      reason:
        "الكونكورات والامتحانات كيجيبو لحظات ديال الضغط. إلا تعلمتي تتحكم فالستريس، غادي تحمي النتائج والحماس ديالك.",
      action: "جرب التنفس 4-7-8 قبل كل فرض لمدة جوج سيمانات.",
    },
    "pensee-critique": {
      name: "التفكير النقدي",
      reason:
        "إلا عرفتي تقيم معلومة، مصدر ولا حجة، غادي يعاونك هادشي فالقراية وفاختيارات التوجيه ديالك.",
      action: "حلل مقال ديال الأخبار كل سيمانة: شنو هو المصدر؟ شنو اللي ناقص؟",
    },
    "travail-equipe": {
      name: "الخدمة الجماعية",
      reason:
        "مشاريع القسم، الهاكاثونات، الخدمات الجماعية: التعاون هو القلب ديال القراية العليا اليوم.",
      action: "خود الدور ديال المنظم فالخدمة الجماعية الجاية ديالك.",
    },
    adaptabilite: {
      name: "التأقلم",
      reason:
        "الطريق ديالك غادي يكون فيها تغييرات (مدينة، طريقة القراية، إيقاع جديد). التأقلم كيسهل عليك كل تغيير.",
      action: "بدل عادة وحدة فالقراية لمدة سيمانة وكتب شنو تعلمتي.",
    },
    leadership: {
      name: "القيادة",
      reason:
        "عندك موهبة طبيعية فالتنظيم. إلا طورتيها، غادي تحل ليك مسؤوليات فالأندية ديال الطلبة ومن بعد فالخدمة.",
      action: "قترح هاد الشهر تنشط مراجعة جماعية ولا شي نشاط فالليسي ديالك.",
    },
    creativite: {
      name: "الإبداع",
      reason:
        "القدرة ديالك باش تجيب أفكار جديدة كتميزك، خصوصاً فالمعلوميات وريادة الأعمال.",
      action: "دير كناش ديال الأفكار: كتب 3 أفكار كل نهار، واخا يكونو غريبين.",
    },
  },
  resources: {
    "res-python-oc": {
      title: "الأساسيات ديال Python",
      description:
        "كورس ديال المبتدئين مزيان قبل ما تدخل مدرسة ديال المعلوميات: المتغيرات، الحلقات، الدوال وأول مشروع صغير.",
      duration: "20 ساعة · OpenClassrooms",
    },
    "res-web-coursera": {
      title: "مدخل لتطوير الويب",
      description:
        "HTML، CSS وJavaScript: دير أول صفحة شخصية ديالك وفهم الخدمة ديال مطور الواجهة (front-end).",
      duration: "30 ساعة · Coursera",
    },
    "res-maths-fun": {
      title: "الرياضيات: المنطق والاستدلال",
      description:
        "راجع المنطق، المجموعات والجبر — الأساس اللي كيطلبوه فـCPGE وENSA ومدارس المعلوميات.",
      duration: "25 ساعة · FUN MOOC",
    },
    "res-data-alx": {
      title: "مدخل للداتا ساينس",
      description:
        "اكتشف شنو كيديرو الداتا أناليست: Excel، أول المبيانات، الإحصاء الوصفي وحالات تطبيقية.",
      duration: "40 ساعة · ALX / Coursera",
    },
    "res-podcast-orientation": {
      title: "Génération Orientation",
      description:
        "بودكاست مغربي: طلبة كيحكيو على الطريق ديالهم (ENCG، الطب، مدارس المهندسين) والنصائح ديالهم.",
      duration: "25 دقيقة / حلقة",
    },
    "res-podcast-tech": {
      title: "الكواليس ديال مهن التكنولوجيا",
      description:
        "مطورين، داتا أناليست وبروداكت مانجرز كيحكيو على نهار عادي فالخدمة ديالهم فالمغرب وبرا.",
      duration: "35 دقيقة / حلقة",
    },
    "res-podcast-methodes": {
      title: "طرق قراية فعالة",
      description:
        "تقنيات عملية للحفظ، أخذ النوط والمراجعة، تقدر تطبقهم من هاد السيمانة.",
      duration: "20 دقيقة / حلقة",
    },
    "res-ebook-filieres": {
      title: "دليل الشعب العلمية فالمغرب",
      description:
        "نظرة واضحة: CPGE، ENSA، FST، ENSIAS، الطب — الدخول، المحتوى، فرص الخدمة والشهادات.",
      duration: "60 صفحة · PDF",
    },
    "res-ebook-apprendre": {
      title: "تعلم كيفاش تتعلم",
      description:
        "كتاب إلكتروني عملي على التركيز، خطة المراجعة والذاكرة: مزيان قبل ما تدخل للقراية العليا.",
      duration: "45 صفحة · PDF",
    },
    "res-ebook-confiance": {
      title: "تيق فراسك فاش كتهضر قدام الناس",
      description:
        "تمارين خطوة بخطوة باش تهضر قدام الناس بلا ستريس: مفيدة للمناقشات والشفوي ديال الكونكورات.",
      duration: "30 صفحة · PDF",
    },
  },
  roadmap: {
    "rm-explore-1": {
      title: "تلاقى مع شي طالب من المجال",
      description: "لقا شي طالب فالمعلوميات ولا فمدرسة المهندسين (العائلة، الليسي، LinkedIn) وسولو 5 أسئلة.",
    },
    "rm-explore-2": {
      title: "مشي لشي يوم مفتوح",
      description: "كتب التواريخ ديال الأيام المفتوحة ديال المدارس اللي باغي (ENSIAS، ENSA، FST، ENCG) ووجد 3 أسئلة.",
    },
    "rm-learn-1": {
      title: "كمل كورس ديال المبتدئين",
      description: "ختار الكورس ديال Python ولا تطوير الويب من الموارد ديالك وكمل الوحدة الأولى.",
    },
    "rm-learn-2": {
      title: "قوي الأساس ديالك فالماط",
      description: "راجع المنطق، الجبر وحساب المثلثات: كيتحتاجو فكاع الشعب العلمية اللي باغي.",
    },
    "rm-practice-1": {
      title: "دير مشروع صغير",
      description: "دير مشروع صغير وملموس: صفحة ويب شخصية، سكريبت مفيد ولا عرض تقدمو للقسم ديالك.",
    },
    "rm-practice-2": {
      title: "دخل لشي نادي ولا هاكاثون",
      description: "نادي الروبوتيك، العلوم، المناظرة ولا هاكاثون فمدينتك: التجربة مع الجماعة مهمة بحال النقط.",
    },
    "rm-prepare-1": {
      title: "وجد الملف ديال الترشيح",
      description: "جمع كشوف النقط، CV بسيط ولاتر دو موتيفاسيون نموذجية للترشيحات ديالك.",
    },
    "rm-prepare-2": {
      title: "قرا على الكونكورات ديال الدخول",
      description: "CNC، TAFEM، كونكورات ENSIAS/ENSA: التواريخ، الاختبارات والامتحانات القديمة باش تحملهم.",
    },
  },
  questions: {
    bacStream: {
      question: "شنو هي الشعبة ديالك فالباك؟",
      helper: "هادشي كيعاونا نعرفو الأساس الأكاديمي ديالك.",
      options: {
        "sciences-math": "علوم رياضية",
        "sciences-experimentales": "علوم تجريبية",
        "sciences-economiques": "علوم اقتصادية",
        "lettres-sciences-humaines": "آداب وعلوم إنسانية",
        "sciences-techniques": "علوم وتكنولوجيا",
        autre: "حالة أخرى",
      },
    },
    academicStrengths: {
      question: "شنو هوما نقاط القوة ديالك فالقراية؟",
      helper: "ختار حتى 4 أجوبة.",
      options: {
        "logique-math": "المنطق والحساب",
        memoire: "الحفظ والاسترجاع",
        redaction: "الكتابة والتحليل",
        experimentation: "التجريب",
        organisation: "التنظيم والطريقة",
        creativite: "الإبداع والخيال",
      },
    },
    favouriteSubjects: {
      question: "شنو هوما المواد اللي كتبغي كتر؟",
      helper: "ختار حتى 5 مواد.",
      options: {
        maths: "الرياضيات",
        "physique-chimie": "الفيزيك والكيمياء",
        svt: "علوم الحياة والأرض",
        informatique: "المعلوميات",
        francais: "الفرنسية",
        "histoire-geo": "التاريخ والجغرافيا",
        philosophie: "الفلسفة",
        economie: "الاقتصاد",
        langues: "اللغات الأجنبية",
        arts: "الفنون والديزاين",
      },
    },
    interests: {
      question: "شنو هوما المواضيع اللي كتشعل فيك الحماس برا القراية؟",
      helper: "ختار حتى 5 اهتمامات.",
      options: {
        technologie: "التكنولوجيا والرقمي",
        sante: "الصحة والراحة",
        business: "البيزنس والمقاولة",
        "droit-justice": "القانون والعدالة",
        sciences: "العلوم والابتكار",
        culture: "الثقافة والتواصل",
        environnement: "البيئة",
        art: "الفن والإبداع",
      },
    },
    preferredActivities: {
      question: "شنو كتبغي دير فالواقع؟",
      helper: "ختار حتى 4 أنشطة.",
      options: {
        "resoudre-problemes": "نحل المشاكل",
        experimenter: "نجرب ونخدم بيدي",
        debattre: "نتناقش ونقنع",
        creer: "نصاوب الحوايج",
        aider: "نعاون الناس",
        organiser: "ننظم وننسق",
      },
    },
    workPreference: {
      question: "فين كتشوف راسك خدام؟",
      options: {
        "bureau-structure": "فمكتب منظم بقواعد واضحة",
        "terrain-varie": "فالميدان، كل نهار بحالو",
        laboratoire: "فمختبر ولا فورشة",
        "liberte-remote": "بحرية، ولا حتى نخدم من الدار",
        "contact-client": "مع الكليان ولا المرضى",
      },
    },
    city: {
      question: "فاش من مدينة باغي تقرا؟",
      helper: "رافي غادي ياخد هادشي بعين الاعتبار فاش يقترح عليك المدارس.",
      options: {
        casablanca: "الدار البيضاء",
        rabat: "الرباط",
        marrakech: "مراكش",
        fes: "فاس",
        tanger: "طنجة",
        agadir: "أكادير",
        autre: "مدينة أخرى",
        "peu-importe": "ما مشكلاش / مرن",
      },
    },
    studyType: {
      question: "مؤسسة عمومية ولا خاصة؟",
      options: { public: "عمومية", prive: "خاصة", indifferent: "بجوج كيناسبوني" },
    },
    budget: {
      question: "شحال تقريباً الميزانية ديالك فالعام للقراية؟",
      helper: "مصاريف القراية، بلا السكنى والتنقل.",
      options: {
        "budget-0-5000": "قل من 5000 درهم فالعام",
        "budget-5000-20000": "5000 – 20000 درهم فالعام",
        "budget-20000-40000": "20000 – 40000 درهم فالعام",
        "budget-40000-plus": "كتر من 40000 درهم فالعام",
      },
    },
    careerInterests: {
      question: "شنو هوما المجالات المهنية اللي كيجبدوك اليوم؟",
      helper: "ختار حتى 5 مجالات — واخا مازال ما واضحاش ليك الصورة.",
      options: {
        informatique: "المعلوميات / البرمجة",
        data: "الداتا والذكاء الاصطناعي",
        ingenierie: "الهندسة",
        sante: "الطب / الصحة",
        commerce: "التجارة / الماركتينغ",
        finance: "المالية / التسيير",
        droit: "الحقوق",
        enseignement: "التعليم",
        communication: "التواصل / الإعلام",
        entrepreneur: "المقاولة",
      },
    },
    confidence: {
      question: "شحال واضح ليك الاتجاه ديالك فالقراية؟",
      minLabel: "تالف بالكامل",
      maxLabel: "واضح بزاف",
    },
    mainDifficulty: {
      question: "شنو هي الصعوبة الكبيرة اللي عندك دابا؟",
      options: {
        "orientation-floue": "ما عارفش شنو نختار",
        "information-manquante": "ناقصاني معلومات موثوقة",
        "pression-familiale": "ضغط من العائلة ولا المجتمع",
        "moyens-financiers": "الإمكانيات المادية محدودة",
        "manque-confiance": "ما واثقش فراسي",
        motivation: "الحماس والتنظيم",
      },
    },
    workEnvironment: {
      question: "فاش من بيئة كتخدم مزيان؟",
      options: {
        startup: "ستارتاب نشيطة",
        "grande-entreprise": "شركة كبيرة ومنظمة",
        "secteur-public": "القطاع العمومي / الإدارة",
        "cabinet-liberal": "كابينة حرة / مصحة",
        recherche: "البحث العلمي والمختبرات",
        entreprendre: "ندير المشروع ديالي ونكون باطرون راسي",
      },
    },
    learningStyle: {
      question: "كيفاش كتتعلم مزيان؟",
      options: {
        pratique: "بالتطبيق، يدي فالخدمة",
        theorique: "بالمفاهيم والنظريات القوية",
        equilibre: "بجوج، على حساب المادة",
      },
    },
    workMode: {
      question: "كتفضل تخدم بوحدك ولا مع الجماعة؟",
      options: {
        autonome: "بوحدي، على حساب الإيقاع ديالي",
        collaboratif: "مع الجماعة، بالطاقة ديال الفريق",
        equilibre: "خليط بين جوج",
      },
    },
    leadershipComfort: {
      question: "شحال كتحس براسك مرتاح فاش كتقود جماعة؟",
      minLabel: "كنفضل نتبع",
      maxLabel: "كنبغي نقود",
    },
    communicationConfidence: {
      question: "شحال كتحس براسك مرتاح فاش كتهضر قدام الناس؟",
      minLabel: "كنحشم بزاف",
      maxLabel: "مرتاح بزاف",
    },
    mobility: {
      question: "واش واجد تبعد على الدار على ود القراية ولا الخدمة؟",
      options: {
        "ma-ville": "نبقى فالمدينة ديالي",
        maroc: "نتحرك داخل المغرب، ما كاين مشكل",
        international: "نمشي لبرا",
        remote: "نخدم عن بعد",
      },
    },
    financialConstraint: {
      question: "كيفاش هي الحالة المادية ديالك بالنسبة للقراية؟",
      helper: "رافي كيعدل الاقتراحات ديالو ديال المدارس والمنح.",
      options: {
        aucune: "ما كاين حتى مشكل كبير",
        partielle: "شوية ديال القيود — خاص نديرو الحساب",
        forte: "قيود كبيرة — المنح والمصاريف الرخيصة ضروريين",
      },
    },
    careerPriority: {
      question: "شنو هي الأولوية رقم واحد فالمستقبل المهني ديالك؟",
      options: {
        salaire: "خلصة مزيانة بالزربة",
        stabilite: "الاستقرار والأمان",
        passion: "ندير داكشي اللي كنبغي",
        impact: "يكون عندي تأثير إيجابي",
        equilibre: "توازن بين الخدمة والحياة الشخصية",
      },
    },
    longTermGoal: {
      question: "فين كتشوف راسك من دابا 10 سنين؟",
      options: {
        expert: "خبير معروف فالمجال ديالي",
        direction: "كنسير فريق ولا شركة",
        entreprendre: "مؤسس المشروع ديالي",
        contribuer: "نساهم فمشاريع كبار (البلاد، الجمعيات، البحث)",
        flexible: "تكون عندي حرية ومرونة كتر",
      },
    },
    mainObstacle: {
      question: "شنو هو أكبر عائق شخصي عندك اليوم؟",
      helper: "كون صريح: رافي كيعدل المواكبة ديالو على حساب الجواب ديالك.",
      options: {
        confiance: "ما واثقش فراسي",
        finances: "القيود المادية",
        info: "ناقصاني المعلومات والمواكبة",
        famille: "الضغط ديال العائلة",
        procrastination: "التسويف / التنظيم",
        autre: "حاجة أخرى",
      },
    },
  },
};

const BUNDLES: Record<Locale, ContentBundle> = { fr: TEXT_FR, en: TEXT_EN, ar: TEXT_AR, ary: TEXT_ARY };

/* ------------------------------------------------------------------ */
/* Builders + exported catalogs (follow the current UI language)       */
/* ------------------------------------------------------------------ */

function bundle(locale: Locale): ContentBundle {
  return BUNDLES[locale] ?? TEXT_FR;
}

function buildFields(locale: Locale): FieldMatch[] {
  const text = bundle(locale).fields;
  return FIELD_SKELETON.map(({ id, score }) => {
    const f = text[id] ?? TEXT_FR.fields[id];
    return {
      id,
      name: f.name,
      score,
      explanation: f.explanation,
      strengths: [...f.strengths],
      potentialChallenges: [...f.potentialChallenges],
      nextAction: f.nextAction,
    };
  });
}

function buildSoftSkills(locale: Locale): SoftSkillPriority[] {
  const text = bundle(locale).skills;
  return SOFT_SKILL_SKELETON.map(({ id, currentLevel }) => {
    const s = text[id] ?? TEXT_FR.skills[id];
    return { id, name: s.name, currentLevel, reason: s.reason, action: s.action, completed: false };
  });
}

function buildResources(locale: Locale): LearningResource[] {
  const text = bundle(locale).resources;
  return RESOURCE_SKELETON.map(({ id, type }) => {
    const r = text[id] ?? TEXT_FR.resources[id];
    return { id, type, title: r.title, description: r.description, duration: r.duration, completed: false };
  });
}

function buildRoadmap(locale: Locale): RoadmapStep[] {
  const text = bundle(locale).roadmap;
  return ROADMAP_SKELETON.map(({ id, stage }) => {
    const r = text[id] ?? TEXT_FR.roadmap[id];
    return { id, stage, title: r.title, description: r.description, completed: false };
  });
}

function buildQuestions(skeleton: QuestionSkeleton[], locale: Locale): AssessmentQuestion[] {
  const text = bundle(locale).questions;
  return skeleton.map((q) => {
    const qt = text[q.id] ?? TEXT_FR.questions[q.id];
    const fallback = TEXT_FR.questions[q.id];
    const built: AssessmentQuestion = { id: q.id, question: qt.question, type: q.type, required: q.required };
    const helper = qt.helper ?? fallback.helper;
    if (helper) built.helper = helper;
    if (q.maxSelections !== undefined) built.maxSelections = q.maxSelections;
    if (q.options) {
      built.options = q.options.map((o) => ({
        value: o.value,
        label: qt.options?.[o.value] ?? fallback.options?.[o.value] ?? o.value,
        ...(o.emoji ? { emoji: o.emoji } : {}),
      }));
    }
    if (q.scale) {
      built.scale = {
        min: q.scale.min,
        max: q.scale.max,
        minLabel: qt.minLabel ?? fallback.minLabel ?? "",
        maxLabel: qt.maxLabel ?? fallback.maxLabel ?? "",
      };
    }
    return built;
  });
}

/** Catalogs in a given locale (defaults to the current UI language). */
export const getFieldsCatalog = (locale: Locale = getStoredLocale()) => buildFields(locale);
export const getSoftSkillsCatalog = (locale: Locale = getStoredLocale()) => buildSoftSkills(locale);
export const getResourcesCatalog = (locale: Locale = getStoredLocale()) => buildResources(locale);
export const getRoadmapCatalog = (locale: Locale = getStoredLocale()) => buildRoadmap(locale);
export const getBasicQuestions = (locale: Locale = getStoredLocale()) => buildQuestions(BASIC_SKELETON, locale);
export const getAdvancedQuestions = (locale: Locale = getStoredLocale()) => buildQuestions(ADVANCED_SKELETON, locale);

/** Catalog — 5 academic fields (Moroccan context), in the current UI language. */
export const FIELDS_CATALOG: FieldMatch[] = localizedList(buildFields);
/** Catalog — 8 soft skills, in the current UI language. */
export const SOFT_SKILLS_CATALOG: SoftSkillPriority[] = localizedList(buildSoftSkills);
/** Catalog — 10 learning resources, in the current UI language. */
export const RESOURCES_CATALOG: LearningResource[] = localizedList(buildResources);
/** Catalog — roadmap (8 steps / 4 stages), in the current UI language. */
export const ROADMAP_CATALOG: RoadmapStep[] = localizedList(buildRoadmap);
/** Assessment questions — Basic (12), in the current UI language. */
export const BASIC_QUESTIONS: AssessmentQuestion[] = localizedList((l) => buildQuestions(BASIC_SKELETON, l));
/** Assessment questions — Advanced (10), in the current UI language. */
export const ADVANCED_QUESTIONS: AssessmentQuestion[] = localizedList((l) => buildQuestions(ADVANCED_SKELETON, l));

/* ------------------------------------------------------------------ */
/* Label helpers                                                       */
/* ------------------------------------------------------------------ */

export function findQuestion(questions: AssessmentQuestion[], id: string): AssessmentQuestion | undefined {
  return questions.find((q) => q.id === id);
}

export function optionLabel(questions: AssessmentQuestion[], id: string, value: string): string {
  const q = findQuestion(questions, id);
  return q?.options?.find((o) => o.value === value)?.label ?? value;
}

export function questionLabel(questions: AssessmentQuestion[], id: string): string {
  return findQuestion(questions, id)?.question ?? id;
}

/* ------------------------------------------------------------------ */
/* Demo profile (fictional Moroccan student)                           */
/* ------------------------------------------------------------------ */

export const DEMO_CREDENTIALS = { email: "yassine@demo.ma", password: "demo1234" };

function seedDemoUser(): void {
  const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
  if (users.some((u) => u.email === DEMO_CREDENTIALS.email)) return;
  users.push({
    id: "user-demo-yassine",
    email: DEMO_CREDENTIALS.email,
    passwordB64: typeof window !== "undefined" ? window.btoa(DEMO_CREDENTIALS.password) : "",
    profile: {
      id: "user-demo-yassine",
      name: "Yassine El Amrani",
      email: DEMO_CREDENTIALS.email,
      city: "casablanca",
      bacStream: "sciences-experimentales",
      language: "fr",
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      role: "user" as const,
    },
  });
  write(MOCK_KEYS.users, users);
}

if (typeof window !== "undefined") {
  seedDemoUser();
  if (read<number | null>(MOCK_KEYS.streak, null) === null) write(MOCK_KEYS.streak, 4);
}

type MockUserRecord = { id: string; email: string; passwordB64: string; profile: UserProfile };

/* ------------------------------------------------------------------ */
/* Result generation (deterministic "AI")                              */
/* ------------------------------------------------------------------ */

const BASE_SCORES: Record<string, number> = {
  "informatique-data": 70,
  ingenierie: 65,
  "medecine-sante": 62,
  "commerce-gestion": 60,
  "droit-sciences-po": 55,
};

function computeFieldScores(basic: Record<string, unknown>): { id: string; score: number }[] {
  const scores = { ...BASE_SCORES };
  const bump = (id: string, n: number) => {
    if (id in scores) scores[id] = Math.min(96, scores[id] + n);
  };
  const add = (arr: unknown, fn: (v: string) => void) => {
    if (Array.isArray(arr)) arr.forEach((v) => typeof v === "string" && fn(v));
  };

  const stream = basic["bacStream"];
  if (stream === "sciences-math") {
    bump("informatique-data", 6);
    bump("ingenierie", 4);
  }
  if (stream === "sciences-experimentales") {
    bump("medecine-sante", 5);
    bump("ingenierie", 3);
  }
  if (stream === "sciences-economiques") bump("commerce-gestion", 6);
  if (stream === "lettres-sciences-humaines") {
    bump("droit-sciences-po", 6);
    bump("commerce-gestion", 3);
  }
  if (stream === "sciences-techniques") {
    bump("ingenierie", 5);
    bump("informatique-data", 3);
  }

  add(basic["interests"], (v) => {
    if (v === "technologie") bump("informatique-data", 8);
    if (v === "sciences") {
      bump("ingenierie", 5);
      bump("medecine-sante", 3);
    }
    if (v === "sante") bump("medecine-sante", 8);
    if (v === "business") bump("commerce-gestion", 7);
    if (v === "droit-justice") bump("droit-sciences-po", 8);
    if (v === "culture") bump("droit-sciences-po", 3);
    if (v === "environnement") bump("ingenierie", 3);
    if (v === "art") bump("commerce-gestion", 2);
  });

  add(basic["favouriteSubjects"], (v) => {
    if (v === "informatique") bump("informatique-data", 4);
    if (v === "maths") {
      bump("informatique-data", 3);
      bump("ingenierie", 2);
    }
    if (v === "physique-chimie") {
      bump("ingenierie", 3);
      bump("medecine-sante", 2);
    }
    if (v === "svt") bump("medecine-sante", 3);
    if (v === "economie") bump("commerce-gestion", 3);
    if (v === "histoire-geo" || v === "philosophie" || v === "francais") bump("droit-sciences-po", 2);
  });

  add(basic["careerInterests"], (v) => {
    if (v === "informatique" || v === "data") bump("informatique-data", 6);
    if (v === "ingenierie") bump("ingenierie", 6);
    if (v === "sante") bump("medecine-sante", 6);
    if (v === "commerce" || v === "finance" || v === "entrepreneur") bump("commerce-gestion", 5);
    if (v === "droit") bump("droit-sciences-po", 6);
  });

  const wp = basic["workPreference"];
  if (wp === "laboratoire") {
    bump("medecine-sante", 3);
    bump("ingenierie", 3);
  }
  if (wp === "bureau-structure") {
    bump("droit-sciences-po", 3);
    bump("commerce-gestion", 2);
  }
  if (wp === "liberte-remote") bump("informatique-data", 4);
  if (wp === "contact-client") {
    bump("medecine-sante", 3);
    bump("commerce-gestion", 3);
  }

  return Object.entries(scores)
    .map(([id, score]) => ({ id, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score);
}

function streamLabel(value?: string): string {
  const q = BASIC_QUESTIONS.find((x) => x.id === "bacStream");
  return value ? optionLabel(q ? [q] : BASIC_QUESTIONS, "bacStream", value) : tr("cnt.mock.fallback.stream");
}

function cityLabel(value?: string): string {
  const q = BASIC_QUESTIONS.find((x) => x.id === "city");
  return value ? optionLabel(q ? [q] : BASIC_QUESTIONS, "city", value) : tr("cnt.mock.fallback.city");
}

function fieldById(id: string): FieldMatch {
  const f = FIELDS_CATALOG.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown field: ${id}`);
  return f;
}

function topFieldsFrom(scores: { id: string; score: number }[], count: number): FieldMatch[] {
  return scores.slice(0, count).map(({ id, score }) => ({ ...fieldById(id), score }));
}

const STRENGTH_VALUES = ["logique-math", "memoire", "redaction", "experimentation", "organisation", "creativite"];

function strengthsFrom(basic: Record<string, unknown>): string[] {
  const out = Array.isArray(basic["academicStrengths"])
    ? (basic["academicStrengths"] as string[])
        .filter((s) => STRENGTH_VALUES.includes(s))
        .map((s) => tr(`cnt.mock.strength.${s}`))
    : [];
  const fallback = FIELDS_CATALOG[0].strengths;
  while (out.length < 3) out.push(fallback[out.length % fallback.length]);
  return out.slice(0, 3);
}

function freeSummary(user: UserProfile, answers: Record<string, unknown>): string {
  return tr("cnt.mock.summary.free", {
    name: user.name.split(" ")[0],
    stream: streamLabel(answers["bacStream"] as string),
    city: cityLabel(answers["city"] as string),
  });
}

function premiumSummary(user: UserProfile, basic: Record<string, unknown>, top: FieldMatch[]): string {
  return tr("cnt.mock.summary.premium", {
    name: user.name.split(" ")[0],
    stream: streamLabel(basic["bacStream"] as string).toLowerCase(),
    city: cityLabel(basic["city"] as string),
    field: top[0].name.toLowerCase(),
  });
}

function trialAccessLevel(): string {
  return getTrialStatus().accessLevel;
}

export function generateFreeResult(user: UserProfile, answers: Record<string, unknown>): LatestResult {
  const top = topFieldsFrom(computeFieldScores(answers), 3);

  const result: OrientationResult = {
    profileSummary: freeSummary(user, answers),
    topFields: top,
    strengths: strengthsFrom(answers),
    softSkillPriorities: [SOFT_SKILLS_CATALOG[0]],
    resources: [],
    roadmap: [],
  };
  return {
    kind: "free",
    result,
    accessLevel: trialAccessLevel() as LatestResult["accessLevel"],
    source: isAiFailureSimulated() ? "fallback" : "ai",
    generatedAt: new Date().toISOString(),
  };
}

export function generatePremiumResult(
  user: UserProfile,
  basic: Record<string, unknown>,
  advanced: Record<string, unknown>
): LatestResult {
  const top = topFieldsFrom(computeFieldScores(basic), 3);

  // Soft-skill priorities adapt to advanced answers (deterministic).
  const commLevel = Math.max(40, Math.min(80, 30 + 10 * Number(advanced["communicationConfidence"] ?? 3)));
  const leadLevel = Math.max(40, Math.min(80, 30 + 10 * Number(advanced["leadershipComfort"] ?? 3)));
  const skills: SoftSkillPriority[] = [
    { ...SOFT_SKILLS_CATALOG[0], currentLevel: commLevel },
    { ...SOFT_SKILLS_CATALOG[1] },
    Number(advanced["leadershipComfort"] ?? 3) >= 4
      ? { ...SOFT_SKILLS_CATALOG[6], currentLevel: leadLevel }
      : String(advanced["financialConstraint"] ?? "aucune") === "forte"
        ? { ...SOFT_SKILLS_CATALOG[2] }
        : { ...SOFT_SKILLS_CATALOG[3] },
  ];

  const result: OrientationResult = {
    profileSummary: premiumSummary(user, basic, top),
    topFields: top,
    strengths: strengthsFrom(basic),
    softSkillPriorities: skills,
    resources: RESOURCES_CATALOG.map((r) => ({ ...r })),
    roadmap: ROADMAP_CATALOG.map((r) => ({ ...r })),
  };
  return {
    kind: "premium",
    result,
    accessLevel: trialAccessLevel() as LatestResult["accessLevel"],
    source: isAiFailureSimulated() ? "fallback" : "ai",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Re-localize a stored demo result into the current UI language: catalog
 * items are swapped by id (keeping scores, levels and completion), and the
 * summary/strengths are regenerated from the stored basic answers. Shape and
 * ids are unchanged.
 */
function localizeResult(stored: LatestResult): LatestResult {
  const r = stored.result;
  const fields = new Map(FIELDS_CATALOG.map((f) => [f.id, f]));
  const skills = new Map(SOFT_SKILLS_CATALOG.map((s) => [s.id, s]));
  const resources = new Map(RESOURCES_CATALOG.map((x) => [x.id, x]));
  const roadmap = new Map(ROADMAP_CATALOG.map((x) => [x.id, x]));

  const topFields = r.topFields.map((f) => {
    const c = fields.get(f.id);
    return c ? { ...c, score: f.score } : f;
  });
  const softSkillPriorities = r.softSkillPriorities.map((s) => {
    const c = skills.get(s.id);
    return c ? { ...c, currentLevel: s.currentLevel, completed: s.completed } : s;
  });

  const user = readSessionUser();
  const basic = read<Record<string, unknown> | null>("rafi9i.basic-answers", null);
  let profileSummary = r.profileSummary;
  let strengths = r.strengths;
  if (user && basic) {
    profileSummary = stored.kind === "premium" && topFields.length
      ? premiumSummary(user, basic, topFields)
      : freeSummary(user, basic);
    strengths = strengthsFrom(basic);
  }

  return {
    ...stored,
    result: {
      ...r,
      profileSummary,
      topFields,
      strengths,
      softSkillPriorities,
      resources: r.resources.map((x) => {
        const c = resources.get(x.id);
        return c ? { ...c, completed: x.completed } : x;
      }),
      roadmap: r.roadmap.map((x) => {
        const c = roadmap.get(x.id);
        return c ? { ...c, completed: x.completed } : x;
      }),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Demo trend series (charts on soft-skills & progress pages)          */
/* ------------------------------------------------------------------ */

const SOFT_SKILL_LEVELS = [50, 51, 53, 52, 55, 56, 57, 58];
const WEEKLY_ACTIVITY_VALUES = [6, 9, 7, 12, 10, 14, 13, 11];

/** Week labels "S-7" … "S-1", "Cette sem." in the given locale. */
function weekLabel(locale: Locale, index: number, count: number): string {
  const ago = count - 1 - index;
  return ago === 0
    ? translate(locale, "cnt.mock.week.current")
    : translate(locale, "cnt.mock.week.ago", { n: ago });
}

export const getSoftSkillTrend = (locale: Locale = getStoredLocale()) =>
  SOFT_SKILL_LEVELS.map((level, i, all) => ({ week: weekLabel(locale, i, all.length), level }));
export const getWeeklyActivity = (locale: Locale = getStoredLocale()) =>
  WEEKLY_ACTIVITY_VALUES.map((activity, i, all) => ({ week: weekLabel(locale, i, all.length), activity }));

export const SOFT_SKILL_TREND: { week: string; level: number }[] = localizedList(getSoftSkillTrend);

export const WEEKLY_ACTIVITY: { week: string; activity: number }[] = localizedList(getWeeklyActivity);

/* ------------------------------------------------------------------ */
/* Trial                                                               */
/* ------------------------------------------------------------------ */

const TRIAL_DAYS = 3;

function computeTrialStatus(stored: Partial<TrialStatus> | null): TrialStatus {
  if (!stored || stored.status === undefined || stored.status === "not_started") {
    return { status: "not_started", startedAt: null, expiresAt: null, daysRemaining: 0, accessLevel: "free" };
  }
  if (stored.status === "subscribed") {
    return { status: "subscribed", startedAt: stored.startedAt ?? null, expiresAt: null, daysRemaining: 0, accessLevel: "premium" };
  }
  if (stored.status === "pending") {
    return { status: "pending", startedAt: null, expiresAt: null, daysRemaining: 0, accessLevel: "free", requestedAt: stored.requestedAt ?? null };
  }
  const startedAt = stored.startedAt ? new Date(stored.startedAt) : null;
  const storedExpiresAt = stored.expiresAt ? new Date(stored.expiresAt) : null;
  const durationLimit =
    startedAt && Number.isFinite(startedAt.getTime())
      ? new Date(startedAt.getTime() + TRIAL_DAYS * 86_400_000)
      : null;
  const expiresAt =
    storedExpiresAt && durationLimit
      ? new Date(Math.min(storedExpiresAt.getTime(), durationLimit.getTime()))
      : storedExpiresAt ?? durationLimit;
  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return { status: "expired", startedAt: stored.startedAt ?? null, expiresAt: expiresAt.toISOString(), daysRemaining: 0, accessLevel: "free" };
  }
  const daysRemaining = expiresAt
    ? Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
    : TRIAL_DAYS;
  return { status: "active", startedAt: stored.startedAt ?? null, expiresAt: expiresAt?.toISOString() ?? null, daysRemaining, accessLevel: "premium_preview" };
}

export function getTrialStatus(): TrialStatus {
  return computeTrialStatus(read<Partial<TrialStatus> | null>(MOCK_KEYS.trial, null));
}

export function startTrial(): TrialStatus {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + TRIAL_DAYS * 86_400_000);
  const status: TrialStatus = {
    status: "active",
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    daysRemaining: TRIAL_DAYS,
    accessLevel: "premium_preview",
  };
  write(MOCK_KEYS.trial, status);
  return status;
}

/* Demo simulation tools (visible dans l'interface de démonstration) */
export function simulateActiveTrial(): TrialStatus {
  const s: TrialStatus = {
    status: "active",
    startedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    daysRemaining: 2,
    accessLevel: "premium_preview",
  };
  write(MOCK_KEYS.trial, s);
  return s;
}
export function simulateExpiredTrial(): TrialStatus {
  const s: TrialStatus = {
    status: "active",
    startedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    daysRemaining: 0,
    accessLevel: "free",
  };
  write(MOCK_KEYS.trial, s);
  return s;
}
export function simulateSubscribed(): TrialStatus {
  const s: TrialStatus = {
    status: "subscribed",
    startedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    expiresAt: null,
    daysRemaining: 0,
    accessLevel: "premium",
  };
  write(MOCK_KEYS.trial, s);
  return s;
}
/** Demo equivalent of POST /premium/request: WhatsApp payment sent, awaiting verification. */
export function requestPremium(): TrialStatus {
  const current = getTrialStatus();
  if (current.status === "subscribed" || current.status === "pending") return current;
  const s: TrialStatus = {
    status: "pending",
    startedAt: null,
    expiresAt: null,
    daysRemaining: 0,
    accessLevel: "free",
    requestedAt: new Date().toISOString(),
  };
  write(MOCK_KEYS.trial, s);
  return s;
}
export function resetTrial(): TrialStatus {
  write(MOCK_KEYS.trial, null);
  return getTrialStatus();
}
export function isAiFailureSimulated(): boolean {
  return read<boolean>(MOCK_KEYS.aiFailure, false);
}
export function setAiFailureSimulated(v: boolean): void {
  write(MOCK_KEYS.aiFailure, v);
}
export function resetAllDemoData(): void {
  if (typeof window === "undefined") return;
  Object.values(MOCK_KEYS).forEach((k) => window.localStorage.removeItem(k));
  window.localStorage.removeItem("rafi9i.assessment-store");
  seedDemoUser();
  if (read<number | null>(MOCK_KEYS.streak, null) === null) write(MOCK_KEYS.streak, 4);
}

/* ------------------------------------------------------------------ */
/* Mock backend handlers (same shapes as the real API)                 */
/* ------------------------------------------------------------------ */

function mockToken(user: UserProfile): string {
  return `mock.sanctum.${user.id}.${Math.random().toString(36).slice(2, 10)}`;
}

function authResponseFor(profile: UserProfile): AuthResponse {
  return { user: { ...profile, role: profile.role ?? "user" }, token: mockToken(profile) };
}

/* ------------------------------------------------------------------ */
/* Admin — demo subscribers                                            */
/* ------------------------------------------------------------------ */

function demoSubscribers(): AdminSubscriber[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  const seed: AdminSubscriber[] = [
    { id: "demo-1", name: "Yasmine El Idrissi", email: "yasmine@example.ma", subscription_status: "pending", is_premium: false, premium_requested_at: hoursAgo(1), premium_activated_at: null, premium_expires_at: null, created_at: hoursAgo(30) },
    { id: "demo-2", name: "Amine Benali", email: "amine@example.ma", subscription_status: "pending", is_premium: false, premium_requested_at: hoursAgo(5), premium_activated_at: null, premium_expires_at: null, created_at: hoursAgo(72) },
    { id: "demo-3", name: "Salma Ouazzani", email: "salma@example.ma", subscription_status: "premium", is_premium: true, premium_requested_at: hoursAgo(200), premium_activated_at: hoursAgo(190), premium_expires_at: null, created_at: hoursAgo(400) },
    { id: "demo-4", name: "Hamza Tazi", email: "hamza@example.ma", subscription_status: "free", is_premium: false, premium_requested_at: null, premium_activated_at: null, premium_expires_at: null, created_at: hoursAgo(12) },
  ];
  return read<AdminSubscriber[]>(MOCK_KEYS.adminSubscribers, seed);
}

export const mockApi = {
  adminSubscribers(params: { status?: SubscriptionStatus; search?: string } = {}): AdminSubscriberList {
    const all = demoSubscribers();
    const search = params.search?.trim().toLowerCase();
    const items = all
      .filter((u) => !params.status || u.subscription_status === params.status)
      .filter((u) => !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
      .sort((a, b) => Number(b.subscription_status === "pending") - Number(a.subscription_status === "pending"));
    return {
      pending_count: all.filter((u) => u.subscription_status === "pending").length,
      items,
      pagination: { current_page: 1, last_page: 1, per_page: 20, total: items.length },
    };
  },

  adminSetStatus(id: string, status: "premium" | "free", durationMonths?: number): AdminSubscriber {
    const all = demoSubscribers();
    const index = all.findIndex((u) => u.id === id);
    if (index === -1) throw new ApiError("not_found", tr("cnt.mock.error.userNotFound"), 404);
    const expires = durationMonths ? new Date(Date.now() + durationMonths * 30 * 86_400_000).toISOString() : null;
    const updated: AdminSubscriber =
      status === "premium"
        ? { ...all[index], subscription_status: "premium", is_premium: true, premium_activated_at: new Date().toISOString(), premium_expires_at: expires }
        : { ...all[index], subscription_status: "free", is_premium: false, premium_requested_at: null, premium_activated_at: null, premium_expires_at: null };
    all[index] = updated;
    write(MOCK_KEYS.adminSubscribers, all);
    return updated;
  },

  register(payload: RegisterPayload): AuthResponse {
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new ApiError("validation", tr("cnt.mock.error.accountExists"), 400);
    }
    const profile: UserProfile = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.name,
      email: payload.email,
      language: "fr",
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      role: "user",
    };
    users.push({
      id: profile.id,
      email: profile.email,
      passwordB64: typeof window !== "undefined" ? window.btoa(payload.password) : "",
      profile,
    });
    write(MOCK_KEYS.users, users);
    return authResponseFor(profile);
  },

  login(payload: LoginPayload): AuthResponse {
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    const user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    const ok =
      user &&
      (typeof window === "undefined" || user.passwordB64 === window.btoa(payload.password));
    if (!user || !ok) {
      throw new ApiError("unauthorized", tr("cnt.mock.error.badCredentials"), 401);
    }
    return authResponseFor(user.profile);
  },

  getProfile(): UserProfile {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", tr("cnt.mock.error.unauthenticated"), 401);
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    return users.find((u) => u.id === user.id)?.profile ?? user;
  },

  updateProfile(patch: ProfileUpdatePayload): UserProfile {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", tr("cnt.mock.error.unauthenticated"), 401);
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], profile: { ...users[idx].profile, ...patch } };
      write(MOCK_KEYS.users, users);
    }
    return users[idx]?.profile ?? { ...user, ...patch };
  },

  /** POST /assessments/basic/start — opens a session and returns its sessionId. */
  startBasic(): AssessmentSession {
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    return {
      sessionId: `sess-basic-${crypto.randomUUID().slice(0, 8)}`,
      questions: getBasicQuestions(),
      completed: Boolean(results.free),
      lastSubmittedAt: results.free?.generatedAt ?? null,
    };
  },

  submitBasic(answers: Record<string, unknown>): { result: LatestResult } {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", tr("cnt.mock.error.unauthenticated"), 401);
    // Keep basic answers for the premium analysis (submitAdvanced).
    write("rafi9i.basic-answers", answers);
    const generated = generateFreeResult(user, answers);
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    results.free = generated;
    write(MOCK_KEYS.results, results);
    return { result: this.mergeProgress(generated) };
  },

  /** POST /assessments/advanced/start — opens a session and returns its sessionId. */
  startAdvanced(): AssessmentSession {
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    return {
      sessionId: `sess-advanced-${crypto.randomUUID().slice(0, 8)}`,
      questions: getAdvancedQuestions(),
      completed: Boolean(results.premium),
      lastSubmittedAt: results.premium?.generatedAt ?? null,
    };
  },

  submitAdvanced(answers: Record<string, unknown>): { result: LatestResult } {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", tr("cnt.mock.error.unauthenticated"), 401);
    const basic = read<Record<string, unknown> | null>("rafi9i.basic-answers", null);
    const generated = generatePremiumResult(user, basic ?? {}, answers);
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    results.premium = generated;
    write(MOCK_KEYS.results, results);
    return { result: this.mergeProgress(generated) };
  },

  getLatestResult(): LatestResult | null {
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    const latest = results.premium ?? results.free ?? null;
    return latest ? this.mergeProgress(latest) : null;
  },

  requestPremium(): TrialStatus {
    return requestPremium();
  },

  getTrialStatus(): TrialStatus {
    return getTrialStatus();
  },

  updateResource(id: string, completed: boolean): { id: string; completed: boolean } {
    const map = read<Record<string, boolean>>(MOCK_KEYS.resourceProgress, {});
    map[id] = completed;
    write(MOCK_KEYS.resourceProgress, map);
    return { id, completed };
  },

  updateRoadmap(id: string, completed: boolean): { id: string; completed: boolean } {
    const map = read<Record<string, boolean>>(MOCK_KEYS.roadmapProgress, {});
    map[id] = completed;
    write(MOCK_KEYS.roadmapProgress, map);
    return { id, completed };
  },

  /**
   * Merge stored progress into a result copy (same shape as GET /results/latest),
   * localized into the current UI language.
   */
  mergeProgress(result: LatestResult): LatestResult {
    const resMap = read<Record<string, boolean>>(MOCK_KEYS.resourceProgress, {});
    const roadMap = read<Record<string, boolean>>(MOCK_KEYS.roadmapProgress, {});
    const localized = localizeResult(result);
    return {
      ...localized,
      result: {
        ...localized.result,
        resources: localized.result.resources.map((r) => ({ ...r, completed: resMap[r.id] ?? r.completed })),
        roadmap: localized.result.roadmap.map((r) => ({ ...r, completed: roadMap[r.id] ?? r.completed })),
      },
    };
  },

  saveBasicAnswers(answers: Record<string, unknown>): void {
    write("rafi9i.basic-answers", answers);
  },

  getDashboard(): DashboardData {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", tr("cnt.mock.error.unauthenticated"), 401);
    const trial = getTrialStatus();
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    const premium = results.premium ? localizeResult(results.premium) : undefined;
    const free = results.free ? localizeResult(results.free) : undefined;
    const resMap = read<Record<string, boolean>>(MOCK_KEYS.resourceProgress, {});
    const roadMap = read<Record<string, boolean>>(MOCK_KEYS.roadmapProgress, {});

    let profileCompletion = 25;
    if (user.onboardingCompleted) profileCompletion += 15;
    if (free) profileCompletion += 30;
    if (premium) profileCompletion += 15;
    if (trial.status === "active" || trial.status === "subscribed") profileCompletion += 15;

    const primary = (premium ?? free)?.result.topFields[0] ?? null;
    const roadmapTotal = premium?.result.roadmap.length ?? 0;
    const roadmapDone = premium ? premium.result.roadmap.filter((r) => roadMap[r.id]).length : 0;

    const nextAction = !free
      ? tr("cnt.mock.next.assessment")
      : trial.status === "not_started"
        ? tr("cnt.mock.next.freeResult")
        : trial.status === "active" && !premium
          ? tr("cnt.mock.next.advanced")
          : premium
            ? tr("cnt.mock.next.challenge")
            : tr("cnt.mock.next.explore");

    const challenge = premium?.result.softSkillPriorities[0] ?? null;

    return {
      profileCompletion,
      trial,
      orientationStage: !free
        ? tr("cnt.mock.stage.discovery")
        : !premium
          ? trial.status === "active"
            ? tr("cnt.mock.stage.deepAvailable")
            : tr("cnt.mock.stage.firstResults")
          : tr("cnt.mock.stage.advanced"),
      primaryField: primary,
      weeklyChallenge: challenge,
      roadmapProgress: roadmapTotal ? Math.round((roadmapDone / roadmapTotal) * 100) : 0,
      completedResources: premium ? Object.values(resMap).filter(Boolean).length : 0,
      streak: read<number>(MOCK_KEYS.streak, 4),
      nextAction,
    };
  },
};
