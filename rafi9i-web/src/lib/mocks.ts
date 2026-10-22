/**
 * Rafi9i — Mock data + localStorage-backed mock backend (Developer 2)
 * ---------------------------------------------------------------------
 * Mirrors the FINAL API contract (Laravel + Sanctum) so pages never change
 * when switching to live mode. All data is clearly demonstration content:
 * the UI shows a "Mode démo" badge while this layer is active.
 *
 * NOTE: no secrets here — mock passwords are base64 demo values only.
 */
import {
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
  TrialStatus,
  UserProfile,
} from "./types";

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
/* Catalog — 5 academic fields (Moroccan context)                      */
/* ------------------------------------------------------------------ */

export const FIELDS_CATALOG: FieldMatch[] = [
  {
    id: "informatique-data",
    name: "Informatique & Data",
    score: 82,
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
  {
    id: "ingenierie",
    name: "Ingénierie & Sciences appliquées",
    score: 74,
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
  {
    id: "medecine-sante",
    name: "Médecine & Santé",
    score: 71,
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
  {
    id: "commerce-gestion",
    name: "Commerce & Gestion (ENCG)",
    score: 68,
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
  {
    id: "droit-sciences-po",
    name: "Droit & Sciences politiques",
    score: 63,
    explanation:
      "Ton aisance à l'écrit, ton goût du débat et ton intérêt pour la société correspondent aux filières droit (université) et sciences politiques ( Rabat, Tanger, Ifrane). Débouchés : avocat, notaire, juridique d'entreprise, administration publique, organisations internationales.",
    strengths: [
      "Qualités rédactionnelles et argumentation",
      "Culture générale et curiosité pour l'actualité",
      "Capacité d'analyse de situations complexes",
    ],
    potentialChallenges: [
      "Amphi chargés en première année de droit",
      "Mémorisation intensive (codes, jurisprudence)",
      "Concours administratifs compétitifs en sortie",
    ],
    nextAction:
      "Assiste à un cours ouvert en fac de droit et lis un arrêt commenté pour tester ton intérêt réel pour la matière.",
  },
];

/* ------------------------------------------------------------------ */
/* Catalog — 8 soft skills                                             */
/* ------------------------------------------------------------------ */

export const SOFT_SKILLS_CATALOG: SoftSkillPriority[] = [
  {
    id: "communication-orale",
    name: "Communication orale",
    currentLevel: 55,
    reason:
      "Presque toutes les filières qui te correspondent incluent des soutenances et des présentations. Renforcer ta communication orale multiplie ton impact dès la première année.",
    action: "Présente en 3 minutes un sujet qui te passionne devant un proche, une fois par semaine.",
    completed: false,
  },
  {
    id: "gestion-du-temps",
    name: "Gestion du temps",
    currentLevel: 62,
    reason:
      "Les cursus sélectifs (CPGE, médecine, écoles d'ingénieurs) demandent un rythme soutenu. Une méthode de travail solide fait la différence dès le bac.",
    action: "Planifie chaque dimanche ta semaine avec 3 priorités par jour, et compare le vendredi.",
    completed: false,
  },
  {
    id: "gestion-du-stress",
    name: "Gestion du stress",
    currentLevel: 66,
    reason:
      "Concours et examens créent des pics de pression. Apprendre à réguler ton stress protège tes performances et ta motivation.",
    action: "Essaie la respiration 4-7-8 avant chaque devoir pendant deux semaines.",
    completed: false,
  },
  {
    id: "pensee-critique",
    name: "Pensée critique",
    currentLevel: 72,
    reason:
      "Savoir évaluer une information, une source ou un argument t'aidera dans les études comme dans tes choix d'orientation.",
    action: "Analyse un article d'actualité par semaine : quelle est la source ? Que manque-t-il ?",
    completed: false,
  },
  {
    id: "travail-equipe",
    name: "Travail d'équipe",
    currentLevel: 74,
    reason:
      "Projets de classe, hackathons, travaux de groupe : la collaboration est au cœur des études supérieures modernes.",
    action: "Prends le rôle d'organisateur dans ton prochain travail de groupe.",
    completed: false,
  },
  {
    id: "adaptabilite",
    name: "Adaptabilité",
    currentLevel: 70,
    reason:
      "Ton parcours va te réserver des changements (ville, méthode d'apprentissage, nouveaux rythmes). L'adaptabilité réduit le coût de chaque transition.",
    action: "Change une habitude d'étude pendant une semaine et note ce que tu apprends.",
    completed: false,
  },
  {
    id: "leadership",
    name: "Leadership",
    currentLevel: 58,
    reason:
      "Tu as des aptitudes naturelles à organiser. Les développer t'ouvrira des responsabilités dans les clubs étudiants et plus tard en entreprise.",
    action: "Propose d'animer une révision collective ou un événement dans ton lycée ce mois-ci.",
    completed: false,
  },
  {
    id: "creativite",
    name: "Créativité",
    currentLevel: 76,
    reason:
      "Ta capacité à proposer des idées neuves est un atout différenciant, notamment en informatique et en entrepreneuriat.",
    action: "Tiens un carnet d'idées : note 3 idées par jour, même farfelues.",
    completed: false,
  },
];

/* ------------------------------------------------------------------ */
/* Catalog — 10 learning resources                                     */
/* ------------------------------------------------------------------ */

export const RESOURCES_CATALOG: LearningResource[] = [
  {
    id: "res-python-oc",
    type: "course",
    title: "Fondamentaux de Python",
    description:
      "Cours d'initiation idéal avant une école d'informatique : variables, boucles, fonctions et premier mini-projet.",
    duration: "20 h · OpenClassrooms",
    completed: false,
  },
  {
    id: "res-web-coursera",
    type: "course",
    title: "Introduction au développement web",
    description:
      "HTML, CSS et JavaScript : construis ta première page personnelle et comprends le métier de développeur front-end.",
    duration: "30 h · Coursera",
    completed: false,
  },
  {
    id: "res-maths-fun",
    type: "course",
    title: "Mathématiques : logique et raisonnement",
    description:
      "Remets à niveau logique, ensembles et algèbre — la base demandée en CPGE, ENSA et écoles d'informatique.",
    duration: "25 h · FUN MOOC",
    completed: false,
  },
  {
    id: "res-data-alx",
    type: "course",
    title: "Initiation à la data science",
    description:
      "Découvre ce que font les data analysts : Excel, premiers graphiques, statistiques descriptives et cas pratiques.",
    duration: "40 h · ALX / Coursera",
    completed: false,
  },
  {
    id: "res-podcast-orientation",
    type: "podcast",
    title: "Génération Orientation",
    description:
      "Podcast marocain : des étudiants racontent leur parcours (ENCG, médecine, écoles d'ingénieurs) et leurs conseils.",
    duration: "25 min / épisode",
    completed: false,
  },
  {
    id: "res-podcast-tech",
    type: "podcast",
    title: "Les coulisses des métiers tech",
    description:
      "Développeurs, data analysts et product managers racontent une journée type de leur métier au Maroc et à l'étranger.",
    duration: "35 min / épisode",
    completed: false,
  },
  {
    id: "res-podcast-methodes",
    type: "podcast",
    title: "Méthodes d'apprentissage efficaces",
    description:
      "Techniques concrètes de mémorisation, de prise de notes et de révision, applicables dès cette semaine.",
    duration: "20 min / épisode",
    completed: false,
  },
  {
    id: "res-ebook-filieres",
    type: "ebook",
    title: "Guide des filières scientifiques au Maroc",
    description:
      "Panorama clair : CPGE, ENSA, FST, ENSIAS, médecine — admission, contenu, débouchés et témoignages.",
    duration: "60 pages · PDF",
    completed: false,
  },
  {
    id: "res-ebook-apprendre",
    type: "ebook",
    title: "Apprendre à apprendre",
    description:
      "E-book pratique sur la concentration, le plan de révision et la mémoire : parfait avant la rentrée supérieure.",
    duration: "45 pages · PDF",
    completed: false,
  },
  {
    id: "res-ebook-confiance",
    type: "ebook",
    title: "Prendre confiance en sa prise de parole",
    description:
      "Exercices progressifs pour parler en public sans stress : utile pour les soutenances et les oraux de concours.",
    duration: "30 pages · PDF",
    completed: false,
  },
];

/* ------------------------------------------------------------------ */
/* Catalog — roadmap (8 steps / 4 stages)                              */
/* ------------------------------------------------------------------ */

export const ROADMAP_CATALOG: RoadmapStep[] = [
  {
    id: "rm-explore-1",
    stage: "explore",
    title: "Rencontre un étudiant du domaine",
    description: "Identifie un étudiant en informatique ou en école d'ingénieurs (famille, lycée, LinkedIn) et pose-lui 5 questions.",
    completed: false,
  },
  {
    id: "rm-explore-2",
    stage: "explore",
    title: "Assiste à une journée portes ouvertes",
    description: "Note les dates des JPO des écoles visées (ENSIAS, ENSA, FST, ENCG) et prépare 3 questions à poser.",
    completed: false,
  },
  {
    id: "rm-learn-1",
    stage: "learn",
    title: "Termine un cours d'initiation",
    description: "Choisis le cours Python ou développement web dans tes ressources et termine le premier module.",
    completed: false,
  },
  {
    id: "rm-learn-2",
    stage: "learn",
    title: "Renforce tes maths fondamentales",
    description: "Consolide logique, algèbre et trigonométrie : elles servent dans toutes les filières scientifiques visées.",
    completed: false,
  },
  {
    id: "rm-practice-1",
    stage: "practice",
    title: "Réalise un mini-projet",
    description: "Crée un petit projet concret : page web personnelle, script utile ou exposé présenté à ta classe.",
    completed: false,
  },
  {
    id: "rm-practice-2",
    stage: "practice",
    title: "Rejoins un club ou un hackathon",
    description: "Club robotics, sciences, débat ou hackathon local : l'expérience collective compte autant que les notes.",
    completed: false,
  },
  {
    id: "rm-prepare-1",
    stage: "prepare",
    title: "Prépare ton dossier de candidature",
    description: "Rassembler relevés de notes, CV simple et lettre de motivation type pour tes candidatures.",
    completed: false,
  },
  {
    id: "rm-prepare-2",
    stage: "prepare",
    title: "Étudie les concours d'entrée",
    description: "CNC, TAFEM, concours ENSIAS/ENSA : calendrier, épreuves et annales à télécharger.",
    completed: false,
  },
];

/* ------------------------------------------------------------------ */
/* Assessment questions — Basic (12)                                   */
/* ------------------------------------------------------------------ */

export const BASIC_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "bacStream",
    question: "Quelle est ta filière au baccalauréat ?",
    helper: "Cela nous aide à connaître tes bases académiques.",
    type: "single",
    required: true,
    options: [
      { value: "sciences-math", label: "Sciences Mathématiques", emoji: "📐" },
      { value: "sciences-experimentales", label: "Sciences Expérimentales", emoji: "🔬" },
      { value: "sciences-economiques", label: "Sciences Économiques", emoji: "📊" },
      { value: "lettres-sciences-humaines", label: "Lettres & Sciences humaines", emoji: "📚" },
      { value: "sciences-techniques", label: "Sciences & Technologies", emoji: "⚙️" },
      { value: "autre", label: "Autre situation", emoji: "🎒" },
    ],
  },
  {
    id: "academicStrengths",
    question: "Quels sont tes points forts académiques ?",
    helper: "Choisis jusqu'à 4 réponses.",
    type: "multi",
    maxSelections: 4,
    required: true,
    options: [
      { value: "logique-math", label: "Logique & calcul", emoji: "🧮" },
      { value: "memoire", label: "Mémoire & restitution", emoji: "🧠" },
      { value: "redaction", label: "Rédaction & analyse", emoji: "✍️" },
      { value: "experimentation", label: "Expérimentation", emoji: "⚗️" },
      { value: "organisation", label: "Organisation & méthode", emoji: "🗂️" },
      { value: "creativite", label: "Créativité & imagination", emoji: "💡" },
    ],
  },
  {
    id: "favouriteSubjects",
    question: "Quelles sont tes matières préférées ?",
    helper: "Choisis jusqu'à 5 matières.",
    type: "multi",
    maxSelections: 5,
    required: true,
    options: [
      { value: "maths", label: "Mathématiques", emoji: "➗" },
      { value: "physique-chimie", label: "Physique-chimie", emoji: "🧪" },
      { value: "svt", label: "SVT", emoji: "🌱" },
      { value: "informatique", label: "Informatique", emoji: "💻" },
      { value: "francais", label: "Français", emoji: "🇫🇷" },
      { value: "histoire-geo", label: "Histoire-géographie", emoji: "🌍" },
      { value: "philosophie", label: "Philosophie", emoji: "🦉" },
      { value: "economie", label: "Économie", emoji: "📈" },
      { value: "langues", label: "Langues étrangères", emoji: "🗣️" },
      { value: "arts", label: "Arts & design", emoji: "🎨" },
    ],
  },
  {
    id: "interests",
    question: "Quels sujets te passionnent en dehors des cours ?",
    helper: "Choisis jusqu'à 5 centres d'intérêt.",
    type: "multi",
    maxSelections: 5,
    required: true,
    options: [
      { value: "technologie", label: "Technologie & numérique", emoji: "🤖" },
      { value: "sante", label: "Santé & bien-être", emoji: "🩺" },
      { value: "business", label: "Business & entrepreneuriat", emoji: "🚀" },
      { value: "droit-justice", label: "Droit & justice", emoji: "⚖️" },
      { value: "sciences", label: "Sciences & innovation", emoji: "🔭" },
      { value: "culture", label: "Culture & communication", emoji: "🎭" },
      { value: "environnement", label: "Environnement", emoji: "🌍" },
      { value: "art", label: "Art & création", emoji: "🎬" },
    ],
  },
  {
    id: "preferredActivities",
    question: "Qu'est-ce que tu préfères faire concrètement ?",
    helper: "Choisis jusqu'à 4 activités.",
    type: "multi",
    maxSelections: 4,
    required: true,
    options: [
      { value: "resoudre-problemes", label: "Résoudre des problèmes", emoji: "🧩" },
      { value: "experimenter", label: "Expérimenter & manipuler", emoji: "🧫" },
      { value: "debattre", label: "Débattre & convaincre", emoji: "💬" },
      { value: "creer", label: "Créer des choses", emoji: "🛠️" },
      { value: "aider", label: "Aider les autres", emoji: "🤝" },
      { value: "organiser", label: "Organiser & coordonner", emoji: "📋" },
    ],
  },
  {
    id: "workPreference",
    question: "Dans quel cadre te vois-tu travailler ?",
    type: "single",
    required: true,
    options: [
      { value: "bureau-structure", label: "Un bureau structuré, des procédures claires", emoji: "🏢" },
      { value: "terrain-varie", label: "Sur le terrain, des journées variées", emoji: "🚗" },
      { value: "laboratoire", label: "Un laboratoire ou un atelier", emoji: "🔬" },
      { value: "liberte-remote", label: "De la liberté, voire du télétravail", emoji: "🏝️" },
      { value: "contact-client", label: "Au contact des clients ou patients", emoji: "🧑‍🤝‍🧑" },
    ],
  },
  {
    id: "city",
    question: "Dans quelle ville souhaites-tu étudier ?",
    helper: "Rafi en tiendra compte dans ses recommandations d'écoles.",
    type: "single",
    required: true,
    options: [
      { value: "casablanca", label: "Casablanca", emoji: "🌊" },
      { value: "rabat", label: "Rabat", emoji: "🏛️" },
      { value: "marrakech", label: "Marrakech", emoji: "🌴" },
      { value: "fes", label: "Fès", emoji: "🕌" },
      { value: "tanger", label: "Tanger", emoji: "⛴️" },
      { value: "agadir", label: "Agadir", emoji: "🏖️" },
      { value: "autre", label: "Une autre ville", emoji: "📍" },
      { value: "peu-importe", label: "Peu importe / flexible", emoji: "🧭" },
    ],
  },
  {
    id: "studyType",
    question: "Plutôt établissement public ou privé ?",
    type: "single",
    required: true,
    options: [
      { value: "public", label: "Public", emoji: "🎓" },
      { value: "prive", label: "Privé", emoji: "🏫" },
      { value: "indifferent", label: "Les deux me conviennent", emoji: "🤷" },
    ],
  },
  {
    id: "budget",
    question: "Quel est ton budget annuel approximatif pour les études ?",
    helper: "Frais de scolarité, hors logement et transport.",
    type: "single",
    required: true,
    options: [
      { value: "budget-0-5000", label: "Moins de 5 000 DH/an", emoji: "🪙" },
      { value: "budget-5000-20000", label: "5 000 – 20 000 DH/an", emoji: "💵" },
      { value: "budget-20000-40000", label: "20 000 – 40 000 DH/an", emoji: "💰" },
      { value: "budget-40000-plus", label: "Plus de 40 000 DH/an", emoji: "🏆" },
    ],
  },
  {
    id: "careerInterests",
    question: "Quels domaines professionnels t'attirent aujourd'hui ?",
    helper: "Choisis jusqu'à 5 domaines — même si ce n'est pas encore clair.",
    type: "multi",
    maxSelections: 5,
    required: true,
    options: [
      { value: "informatique", label: "Informatique / développement", emoji: "💻" },
      { value: "data", label: "Data & IA", emoji: "📊" },
      { value: "ingenierie", label: "Ingénierie", emoji: "🏗️" },
      { value: "sante", label: "Médecine / santé", emoji: "⚕️" },
      { value: "commerce", label: "Commerce / marketing", emoji: "🛍️" },
      { value: "finance", label: "Finance / gestion", emoji: "🏦" },
      { value: "droit", label: "Droit", emoji: "⚖️" },
      { value: "enseignement", label: "Enseignement", emoji: "🎓" },
      { value: "communication", label: "Communication / médias", emoji: "📣" },
      { value: "entrepreneur", label: "Entrepreneuriat", emoji: "🚀" },
    ],
  },
  {
    id: "confidence",
    question: "À quel point te sens-tu clair sur ta direction académique ?",
    type: "scale",
    required: true,
    scale: {
      min: 1,
      max: 5,
      minLabel: "Complètement perdu(e)",
      maxLabel: "Très clair",
    },
  },
  {
    id: "mainDifficulty",
    question: "Quelle est ta difficulté principale en ce moment ?",
    type: "single",
    required: true,
    options: [
      { value: "orientation-floue", label: "Je ne sais pas quoi choisir", emoji: "🌫️" },
      { value: "information-manquante", label: "Je manque d'informations fiables", emoji: "❓" },
      { value: "pression-familiale", label: "Pression familiale ou sociale", emoji: "👨‍👩‍👧" },
      { value: "moyens-financiers", label: "Moyens financiers limités", emoji: "💸" },
      { value: "manque-confiance", label: "Manque de confiance en moi", emoji: "😔" },
      { value: "motivation", label: "Motivation & organisation", emoji: "⏰" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Assessment questions — Advanced (10)                                */
/* ------------------------------------------------------------------ */

export const ADVANCED_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "workEnvironment",
    question: "Dans quel environnement travailles-tu le mieux ?",
    type: "single",
    required: true,
    options: [
      { value: "startup", label: "Une startup dynamique", emoji: "⚡" },
      { value: "grande-entreprise", label: "Une grande entreprise structurée", emoji: "🏢" },
      { value: "secteur-public", label: "Le secteur public / administratif", emoji: "🏛️" },
      { value: "cabinet-liberal", label: "Un cabinet libéral / une clinique", emoji: "🩺" },
      { value: "recherche", label: "La recherche et les laboratoires", emoji: "🔬" },
      { value: "entreprendre", label: "Entreprendre, être mon propre patron", emoji: "👑" },
    ],
  },
  {
    id: "learningStyle",
    question: "Comment apprends-tu le mieux ?",
    type: "single",
    required: true,
    options: [
      { value: "pratique", label: "En pratiquant, les mains dans le cambouis", emoji: "🛠️" },
      { value: "theorique", label: "Avec des concepts, des théories solides", emoji: "📖" },
      { value: "equilibre", label: "Les deux, selon les matières", emoji: "⚖️" },
    ],
  },
  {
    id: "workMode",
    question: "Tu préfères travailler seul ou en équipe ?",
    type: "single",
    required: true,
    options: [
      { value: "autonome", label: "En autonomie, à mon rythme", emoji: "🧑‍💻" },
      { value: "collaboratif", label: "En équipe, avec de l'énergie collective", emoji: "👥" },
      { value: "equilibre", label: "Un mélange des deux", emoji: "🔄" },
    ],
  },
  {
    id: "leadershipComfort",
    question: "À quel point es-tu à l'aise pour prendre les commandes d'un groupe ?",
    type: "scale",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Je préfère suivre", maxLabel: "J'aime diriger" },
  },
  {
    id: "communicationConfidence",
    question: "À quel point es-tu à l'aise pour parler en public ?",
    type: "scale",
    required: true,
    scale: { min: 1, max: 5, minLabel: "Très réservé(e)", maxLabel: "Très à l'aise" },
  },
  {
    id: "mobility",
    question: "Es-tu prêt(e) à t'éloigner de chez toi pour tes études ou ton travail ?",
    type: "single",
    required: true,
    options: [
      { value: "ma-ville", label: "Rester dans ma ville", emoji: "🏠" },
      { value: "maroc", label: "Bouger au Maroc, sans problème", emoji: "🗺️" },
      { value: "international", label: "Viser l'international", emoji: "✈️" },
      { value: "remote", label: "Travailler à distance", emoji: "🌐" },
    ],
  },
  {
    id: "financialConstraint",
    question: "Quelle est ta situation financière pour les études ?",
    helper: "Rafi adapte ses recommandations d'écoles et de bourses.",
    type: "single",
    required: true,
    options: [
      { value: "aucune", label: "Aucune contrainte majeure", emoji: "🟢" },
      { value: "partielle", label: "Contrainte partielle — il faut optimiser", emoji: "🟡" },
      { value: "forte", label: "Forte — bourses et frais réduits essentiels", emoji: "🔴" },
    ],
  },
  {
    id: "careerPriority",
    question: "Quelle est ta priorité numéro une dans ta future carrière ?",
    type: "single",
    required: true,
    options: [
      { value: "salaire", label: "Un bon salaire rapidement", emoji: "💵" },
      { value: "stabilite", label: "Stabilité et sécurité", emoji: "🛡️" },
      { value: "passion", label: "Faire ce que j'aime", emoji: "❤️" },
      { value: "impact", label: "Avoir un impact positif", emoji: "🌱" },
      { value: "equilibre", label: "Équilibre vie pro / vie perso", emoji: "🌿" },
    ],
  },
  {
    id: "longTermGoal",
    question: "Où te vois-tu dans 10 ans ?",
    type: "single",
    required: true,
    options: [
      { value: "expert", label: "Expert reconnu dans mon domaine", emoji: "🎯" },
      { value: "direction", label: "À la direction d'une équipe ou d'une entreprise", emoji: "📊" },
      { value: "entreprendre", label: "Fondateur / fondatrice de ma propre structure", emoji: "🚀" },
      { value: "contribuer", label: "Contribuer à de grands projets (pays, ONG, recherche)", emoji: "🏗️" },
      { value: "flexible", label: "Gagner en liberté et en flexibilité", emoji: "🕊️" },
    ],
  },
  {
    id: "mainObstacle",
    question: "Quel est ton plus grand obstacle personnel aujourd'hui ?",
    helper: "Sois honnête : Rafi adapte son accompagnement à ta réponse.",
    type: "single",
    required: true,
    options: [
      { value: "confiance", label: "Le manque de confiance en moi", emoji: "🌧️" },
      { value: "finances", label: "Les contraintes financières", emoji: "💰" },
      { value: "info", label: "Le manque d'information et d'accompagnement", emoji: "🧭" },
      { value: "famille", label: "La pression familiale", emoji: "👨‍👩‍👧" },
      { value: "procrastination", label: "La procrastination / l'organisation", emoji: "⏳" },
      { value: "autre", label: "Autre chose", emoji: "🔹" },
    ],
  },
];

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
  return value ? optionLabel(q ? [q] : BASIC_QUESTIONS, "bacStream", value) : "baccalauréat";
}

function cityLabel(value?: string): string {
  const q = BASIC_QUESTIONS.find((x) => x.id === "city");
  return value ? optionLabel(q ? [q] : BASIC_QUESTIONS, "city", value) : "ta ville";
}

function fieldById(id: string): FieldMatch {
  const f = FIELDS_CATALOG.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown field: ${id}`);
  return f;
}

function topFieldsFrom(scores: { id: string; score: number }[], count: number): FieldMatch[] {
  return scores.slice(0, count).map(({ id, score }) => ({ ...fieldById(id), score }));
}

function strengthsFrom(basic: Record<string, unknown>): string[] {
  const map: Record<string, string> = {
    "logique-math": "Rigueur logique et facilité avec les chiffres",
    memoire: "Bonne capacité de mémorisation",
    redaction: "Qualités rédactionnelles et d'analyse",
    experimentation: "Esprit scientifique et goût de l'expérimentation",
    organisation: "Sens de l'organisation et méthode de travail",
    creativite: "Créativité et imagination",
  };
  const out = Array.isArray(basic["academicStrengths"])
    ? (basic["academicStrengths"] as string[]).map((s) => map[s]).filter(Boolean)
    : [];
  while (out.length < 3) out.push(FIELDS_CATALOG[0].strengths[out.length % FIELDS_CATALOG[0].strengths.length]);
  return out.slice(0, 3);
}

function trialAccessLevel(): string {
  return getTrialStatus().accessLevel;
}

export function generateFreeResult(user: UserProfile, answers: Record<string, unknown>): LatestResult {
  const top = topFieldsFrom(computeFieldScores(answers), 3);
  const summary = `${user.name.split(" ")[0]}, élève en ${streamLabel(
    answers["bacStream"] as string
  )} basé(e) à ${cityLabel(answers["city"] as string)}. Ton profil combine des bases scientifiques solides et une vraie curiosité pour les métiers qui transforment le Maroc. Rafi a identifié trois pistes qui correspondent le mieux à tes réponses.`;

  const result: OrientationResult = {
    profileSummary: summary,
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

  const summary = `${user.name.split(" ")[0]}, ${streamLabel(
    basic["bacStream"] as string
  ).toLowerCase()} à ${cityLabel(basic["city"] as string)}. Ta combinaison de rigueur scientifique, de curiosité pratique et d'envie d'impact dessine un profil ${top[0].name.toLowerCase()}. L'analyse approfondie de tes 22 réponses confirme une forte adéquation avec ce domaine, tout en gardant deux alternatives crédibles si tes priorités évoluent.`;

  const result: OrientationResult = {
    profileSummary: summary,
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

/* ------------------------------------------------------------------ */
/* Demo trend series (charts on soft-skills & progress pages)          */
/* ------------------------------------------------------------------ */

export const SOFT_SKILL_TREND: { week: string; level: number }[] = [
  { week: "S-7", level: 50 },
  { week: "S-6", level: 51 },
  { week: "S-5", level: 53 },
  { week: "S-4", level: 52 },
  { week: "S-3", level: 55 },
  { week: "S-2", level: 56 },
  { week: "S-1", level: 57 },
  { week: "Cette sem.", level: 58 },
];

export const WEEKLY_ACTIVITY: { week: string; activity: number }[] = [
  { week: "S-7", activity: 6 },
  { week: "S-6", activity: 9 },
  { week: "S-5", activity: 7 },
  { week: "S-4", activity: 12 },
  { week: "S-3", activity: 10 },
  { week: "S-2", activity: 14 },
  { week: "S-1", activity: 13 },
  { week: "Cette sem.", activity: 11 },
];

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

export const mockApi = {
  register(payload: RegisterPayload): AuthResponse {
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new ApiError("validation", "Un compte existe déjà avec cet email.", 400);
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
      throw new ApiError("unauthorized", "Email ou mot de passe incorrect.", 401);
    }
    return authResponseFor(user.profile);
  },

  getProfile(): UserProfile {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", "Non authentifié.", 401);
    const users = read<MockUserRecord[]>(MOCK_KEYS.users, []);
    return users.find((u) => u.id === user.id)?.profile ?? user;
  },

  updateProfile(patch: ProfileUpdatePayload): UserProfile {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", "Non authentifié.", 401);
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
      questions: BASIC_QUESTIONS,
      completed: Boolean(results.free),
      lastSubmittedAt: results.free?.generatedAt ?? null,
    };
  },

  submitBasic(answers: Record<string, unknown>): { result: LatestResult } {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", "Non authentifié.", 401);
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
      questions: ADVANCED_QUESTIONS,
      completed: Boolean(results.premium),
      lastSubmittedAt: results.premium?.generatedAt ?? null,
    };
  },

  submitAdvanced(answers: Record<string, unknown>): { result: LatestResult } {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", "Non authentifié.", 401);
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

  startTrial(): TrialStatus {
    return startTrial();
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

  /** Merge stored progress into a result copy (same shape as GET /results/latest). */
  mergeProgress(result: LatestResult): LatestResult {
    const resMap = read<Record<string, boolean>>(MOCK_KEYS.resourceProgress, {});
    const roadMap = read<Record<string, boolean>>(MOCK_KEYS.roadmapProgress, {});
    return {
      ...result,
      result: {
        ...result.result,
        resources: result.result.resources.map((r) => ({ ...r, completed: resMap[r.id] ?? r.completed })),
        roadmap: result.result.roadmap.map((r) => ({ ...r, completed: roadMap[r.id] ?? r.completed })),
      },
    };
  },

  saveBasicAnswers(answers: Record<string, unknown>): void {
    write("rafi9i.basic-answers", answers);
  },

  getDashboard(): DashboardData {
    const user = readSessionUser();
    if (!user) throw new ApiError("unauthorized", "Non authentifié.", 401);
    const trial = getTrialStatus();
    const results = read<{ free?: LatestResult; premium?: LatestResult }>(MOCK_KEYS.results, {});
    const premium = results.premium;
    const free = results.free;
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
      ? "Termine l'évaluation d'orientation (10 minutes) pour débloquer ton premier résultat."
      : trial.status === "not_started"
        ? "Découvre ton résultat gratuit et active l'Aperçu Premium de 3 jours."
        : trial.status === "active" && !premium
          ? "Passe l'évaluation approfondie Premium pour affiner ton orientation."
          : premium
            ? "Commence ton défi soft skills de la semaine et avance sur ton parcours."
            : "Explore à nouveau ton résultat et active Premium quand tu es prêt(e).";

    const challenge = premium?.result.softSkillPriorities[0] ?? null;

    return {
      profileCompletion,
      trial,
      orientationStage: !free
        ? "Découverte — évaluation de base à faire"
        : !premium
          ? trial.status === "active"
            ? "Analyse approfondie disponible"
            : "Premiers résultats obtenus"
          : "Orientation avancée — plan d'action en cours",
      primaryField: primary,
      weeklyChallenge: challenge,
      roadmapProgress: roadmapTotal ? Math.round((roadmapDone / roadmapTotal) * 100) : 0,
      completedResources: premium ? Object.values(resMap).filter(Boolean).length : 0,
      streak: read<number>(MOCK_KEYS.streak, 4),
      nextAction,
    };
  },
};
