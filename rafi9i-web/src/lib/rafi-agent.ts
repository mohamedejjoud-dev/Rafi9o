/**
 * Rafi9i — Rafi AI Agent Brain
 * Generates personalized quizzes, analyzes student profiles,
 * creates challenges, and holds smart orientation conversations.
 *
 * This is a frontend AI engine (no external API key required)
 * that simulates an intelligent agent using rule-based NLP + heuristics.
 * Replace the core `generateResponse()` with a real LLM call when ready.
 */

import { api } from "./api";

export type StudentProfile = {
  bacStream?: "sm" | "pc" | "svt" | "eco" | "lettres";
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  preferredStyle?: "analytical" | "creative" | "social" | "practical";
  score?: number; // 0-100 from assessment
  goals?: string[];
};

export type MessageRole = "user" | "rafi";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type?: "text" | "quiz" | "challenge" | "analysis" | "field-list" | "ask";
  data?: QuizData | ChallengeData | AnalysisData | FieldData | AskData;
  timestamp: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  field: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
  focusArea: string;
}

export interface ChallengeData {
  title: string;
  description: string;
  tasks: string[];
  timeframe: string;
  xp: number;
  difficulty: "facile" | "moyen" | "difficile";
}

export interface AnalysisData {
  strengths: { label: string; score: number; color: string }[];
  recommendedFields: { name: string; match: number; color: string; emoji: string }[];
  personalityType: string;
  tip: string;
}

export interface FieldData {
  fields: { name: string; description: string; schools: string[]; match: number }[];
}

export interface AskData {
  question: string;
  options: { id: string; label: string }[];
  profileKey: "preferredStyle" | "bacStream";
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Bank
// ─────────────────────────────────────────────────────────────────────────────

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  sm: [
    {
      id: "sm1", field: "Mathématiques",
      question: "Quelle est la dérivée de f(x) = x³ + 2x ?",
      options: ["f'(x) = 3x² + 2", "f'(x) = x² + 2", "f'(x) = 3x²", "f'(x) = 2x + 1"],
      correctIndex: 0,
      explanation: "La dérivée de xⁿ est n·xⁿ⁻¹, donc (x³)' = 3x² et (2x)' = 2."
    },
    {
      id: "sm2", field: "Physique",
      question: "Un corps de masse 5 kg est soumis à une force de 20 N. Quelle est son accélération ?",
      options: ["4 m/s²", "100 m/s²", "0.25 m/s²", "25 m/s²"],
      correctIndex: 0,
      explanation: "F = ma → a = F/m = 20/5 = 4 m/s²"
    },
    {
      id: "sm3", field: "Logique",
      question: "Si tous les étudiants en CPGE travaillent dur, et Khalid est en CPGE, alors...",
      options: ["Khalid travaille dur", "Khalid est paresseux", "Khalid n'est pas étudiant", "On ne peut pas conclure"],
      correctIndex: 0,
      explanation: "Syllogisme logique : la prémisse s'applique à Khalid."
    },
  ],
  pc: [
    {
      id: "pc1", field: "Chimie",
      question: "Quelle est la formule chimique de l'eau ?",
      options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
      correctIndex: 0,
      explanation: "L'eau est composée de 2 atomes d'hydrogène et 1 d'oxygène : H₂O."
    },
    {
      id: "pc2", field: "Physique",
      question: "L'unité du courant électrique est :",
      options: ["Ampère (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"],
      correctIndex: 0,
      explanation: "L'Ampère est l'unité SI du courant électrique, définie par la loi d'Ohm."
    },
  ],
  svt: [
    {
      id: "svt1", field: "Biologie",
      question: "Quelle organite est responsable de la respiration cellulaire ?",
      options: ["La mitochondrie", "Le noyau", "Le ribosome", "Le réticulum endoplasmique"],
      correctIndex: 0,
      explanation: "La mitochondrie est le 'moteur énergétique' de la cellule (ATP)."
    },
    {
      id: "svt2", field: "Génétique",
      question: "Combien de chromosomes possède une cellule humaine normale ?",
      options: ["46", "23", "92", "48"],
      correctIndex: 0,
      explanation: "L'être humain possède 46 chromosomes (23 paires) dans ses cellules somatiques."
    },
  ],
  eco: [
    {
      id: "eco1", field: "Économie",
      question: "Le PIB mesure :",
      options: ["La valeur totale des biens produits dans un pays", "Le taux d'inflation", "Le chômage national", "La balance commerciale"],
      correctIndex: 0,
      explanation: "Le PIB (Produit Intérieur Brut) représente la valeur des biens et services produits."
    },
    {
      id: "eco2", field: "Management",
      question: "Qu'est-ce que le marketing mix ?",
      options: ["Produit, Prix, Place, Promotion", "Profit, Plan, Performance, Prestige", "Part de marché, Prix, Personnel, Publicité", "Aucune de ces réponses"],
      correctIndex: 0,
      explanation: "Le marketing mix comprend les 4P : Produit, Prix, Place (distribution), Promotion."
    },
  ],
  lettres: [
    {
      id: "let1", field: "Littérature",
      question: "Quel courant littéraire est associé à Victor Hugo ?",
      options: ["Le romantisme", "Le surréalisme", "Le naturalisme", "L'existentialisme"],
      correctIndex: 0,
      explanation: "Hugo est une figure majeure du romantisme français du XIXe siècle."
    },
    {
      id: "let2", field: "Droit",
      question: "La Constitution marocaine de 2011 consacre notamment :",
      options: ["L'amazigh comme langue officielle", "Un régime présidentiel pur", "L'abolition du parlement", "Une monarchie élective"],
      correctIndex: 0,
      explanation: "L'amazigh est reconnu langue officielle aux côtés de l'arabe."
    },
  ],
  general: [
    {
      id: "gen1", field: "Soft Skills",
      question: "Lors d'un travail en groupe difficile, quelle est la meilleure approche ?",
      options: ["Écouter chaque membre et chercher un consensus", "Imposer ton point de vue", "Laisser les autres décider seuls", "Éviter le conflit à tout prix"],
      correctIndex: 0,
      explanation: "L'écoute active et la recherche de consensus sont les piliers du leadership collaboratif."
    },
    {
      id: "gen2", field: "Orientation",
      question: "Une Grande École marocaine reconnue pour l'ingénierie est :",
      options: ["ENSIAS Rabat", "ISCAE Casablanca", "IAV Hassan II", "Al Akhawayn"],
      correctIndex: 0,
      explanation: "L'ENSIAS (École Nationale Supérieure d'Informatique et Analyse des Systèmes) est l'une des meilleures écoles d'ingénierie au Maroc."
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Challenge Bank
// ─────────────────────────────────────────────────────────────────────────────

const CHALLENGES: ChallengeData[] = [
  {
    title: "Préparation concours CPGE",
    description: "Entraîne-toi aux exercices de maths niveau Classes Préparatoires",
    tasks: [
      "Résoudre 5 exercices de suites et séries",
      "Faire une dissertation de physique sur la cinématique",
      "Résumer un chapitre d'algèbre linéaire",
    ],
    timeframe: "3 jours",
    xp: 150,
    difficulty: "difficile",
  },
  {
    title: "Développe ton leadership",
    description: "Un défi de soft skills pour te préparer aux entretiens d'admission",
    tasks: [
      "Présente un exposé de 5 min sur un sujet de ton choix",
      "Organise une session d'étude avec 2 amis",
      "Écris une lettre de motivation fictive pour ISCAE",
    ],
    timeframe: "5 jours",
    xp: 100,
    difficulty: "moyen",
  },
  {
    title: "Découverte des métiers STEM",
    description: "Explore 3 métiers dans les domaines scientifiques et technologiques",
    tasks: [
      "Recherche et résume le rôle d'un ingénieur informaticien au Maroc",
      "Interview (virtuelle) un professionnel de la santé",
      "Compare les débouchés de l'ENSA vs l'ENSIAS",
    ],
    timeframe: "7 jours",
    xp: 80,
    difficulty: "facile",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Profile Analysis Engine
// ─────────────────────────────────────────────────────────────────────────────

function analyzeProfile(profile: StudentProfile): AnalysisData {
  const stream = profile.bacStream ?? "general";

  const fieldMap: Record<string, { name: string; match: number; color: string; emoji: string }[]> = {
    sm: [
      { name: "CPGE / Grandes Écoles", match: 95, color: "#f88541", emoji: "🏆" },
      { name: "ENSIAS / EMI Rabat",    match: 90, color: "#a9894b", emoji: "💻" },
      { name: "UM6P Benguerir",        match: 87, color: "#0284c7", emoji: "🔬" },
      { name: "AIAC Aéronautique",     match: 82, color: "#7c3aed", emoji: "✈️" },
    ],
    pc: [
      { name: "ENSA (Réseau Nat.)",    match: 92, color: "#0284c7", emoji: "⚙️" },
      { name: "Faculté de Médecine",   match: 88, color: "#059669", emoji: "🏥" },
      { name: "ENSAM Mécanique",       match: 84, color: "#f88541", emoji: "🔧" },
      { name: "FST Technologies",      match: 79, color: "#7c3aed", emoji: "🧪" },
    ],
    svt: [
      { name: "Médecine & Pharmacie",  match: 96, color: "#059669", emoji: "🏥" },
      { name: "IAV Hassan II (Agro)",  match: 90, color: "#16a34a", emoji: "🌱" },
      { name: "Biotechnologies",       match: 85, color: "#0284c7", emoji: "🧬" },
      { name: "Médecine Dentaire",     match: 80, color: "#7c3aed", emoji: "😁" },
    ],
    eco: [
      { name: "ISCAE Casablanca",      match: 94, color: "#7c3aed", emoji: "📈" },
      { name: "Réseau ENCG",           match: 90, color: "#f88541", emoji: "🏢" },
      { name: "Al Akhawayn Ifrane",    match: 86, color: "#0284c7", emoji: "🌍" },
      { name: "Droit des Affaires",    match: 78, color: "#059669", emoji: "⚖️" },
    ],
    lettres: [
      { name: "Droit (FSJES)",         match: 93, color: "#7c3aed", emoji: "⚖️" },
      { name: "Journalisme & Médias",  match: 88, color: "#f88541", emoji: "📰" },
      { name: "Sciences Politiques",   match: 84, color: "#0284c7", emoji: "🏛️" },
      { name: "Langues & Traduction",  match: 80, color: "#059669", emoji: "🗣️" },
    ],
  };

  const strengthMap: Record<string, { label: string; score: number; color: string }[]> = {
    sm:  [
      { label: "Raisonnement logique",  score: 92, color: "#f88541" },
      { label: "Résolution de problèmes", score: 88, color: "#a9894b" },
      { label: "Rigueur scientifique",  score: 84, color: "#0284c7" },
      { label: "Pensée abstraite",      score: 80, color: "#7c3aed" },
    ],
    pc:  [
      { label: "Expérimentation",       score: 90, color: "#0284c7" },
      { label: "Analyse quantitative",  score: 86, color: "#f88541" },
      { label: "Curiosité scientifique",score: 82, color: "#059669" },
      { label: "Méthode rigoureuse",    score: 78, color: "#7c3aed" },
    ],
    svt: [
      { label: "Empathie naturelle",    score: 94, color: "#059669" },
      { label: "Observation fine",      score: 88, color: "#16a34a" },
      { label: "Mémoire visuelle",      score: 84, color: "#0284c7" },
      { label: "Esprit de service",     score: 90, color: "#f88541" },
    ],
    eco: [
      { label: "Vision stratégique",    score: 92, color: "#7c3aed" },
      { label: "Leadership naturel",    score: 88, color: "#f88541" },
      { label: "Communication",         score: 86, color: "#0284c7" },
      { label: "Gestion de projet",     score: 82, color: "#059669" },
    ],
    lettres: [
      { label: "Expression écrite",     score: 94, color: "#7c3aed" },
      { label: "Esprit critique",       score: 90, color: "#0284c7" },
      { label: "Empathie culturelle",   score: 86, color: "#059669" },
      { label: "Argumentation",         score: 88, color: "#f88541" },
    ],
  };

  const personalityMap: Record<string, string> = {
    sm: "Le Penseur Analytique",
    pc: "L'Explorateur Scientifique",
    svt: "Le Soignant Empathique",
    eco: "Le Stratège Visionnaire",
    lettres: "Le Penseur Humaniste",
    general: "Le Curious Multi-Potentiel",
  };

  const tipMap: Record<string, string> = {
    sm: "Ta force réside dans ton raisonnement rigoureux. Entraîne-toi aux concours blancs pour affûter ta rapidité d'exécution.",
    pc: "Ton esprit expérimental est un atout rare. Participe à des olympiades de physique et chimie pour te démarquer.",
    svt: "Ton empathie et ta curiosité pour le vivant te préparent naturellement aux professions de santé. Soigne tes notes de biologie.",
    eco: "Ton sens des affaires et du leadership te prédestine aux grandes écoles de commerce. Travaille ton English et tes soft skills.",
    lettres: "Ta plume et ton regard critique sont des atouts rares. Prépare les concours de droit, ISIC et les IEP avec des dissertations régulières.",
    general: "Rafi te recommande de passer le quiz d'orientation complet pour affiner ton profil académique.",
  };

  let fields = fieldMap[stream] ?? fieldMap.sm;
  if (profile.preferredStyle === "creative") {
    fields = [...fields].sort((a, b) => (b.name.includes("Média") || b.name.includes("Design") ? 1 : 0) - (a.name.includes("Média") || a.name.includes("Design") ? 1 : 0));
    fields = fields.map((f, i) => ({ ...f, match: Math.min(99, f.match + (i === 0 ? 3 : 0)) }));
  } else if (profile.preferredStyle === "social") {
    fields = fields.map((f) =>
      /Santé|Médecine|Droit|ENCG|ISCAE/.test(f.name) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  } else if (profile.preferredStyle === "practical") {
    fields = fields.map((f) =>
      /ENSA|ENSAM|FST|Agro/.test(f.name) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  } else if (profile.preferredStyle === "analytical") {
    fields = fields.map((f) =>
      /CPGE|ENSIAS|UM6P|ISCAE/.test(f.name) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  }

  return {
    strengths: strengthMap[stream] ?? strengthMap.sm,
    recommendedFields: fields,
    personalityType: personalityMap[stream] ?? personalityMap.general,
    tip: tipMap[stream] ?? tipMap.general,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection
// ─────────────────────────────────────────────────────────────────────────────

type Intent = "quiz" | "challenge" | "analyze" | "fields" | "greeting" | "ask" | "general";

function detectIntent(input: string): Intent {
  const lower = input.toLowerCase();
  if (/quiz|test|examen|exercice|اختبار/.test(lower)) return "quiz";
  if (/défi|challenge|mission|tâche|تحدي/.test(lower)) return "challenge";
  if (/analys|profil|connaître|point fort|faiblesse|تحليل|ملف/.test(lower)) return "analyze";
  if (/filière|école|université|formation|étude|شعبة|جامعة|مدرسة/.test(lower)) return "fields";
  if (/questionne-moi|ask me|conna[iî]s[- ]moi|اسألني|who am i|mon caract/.test(lower)) return "ask";
  if (/bonjour|salam|salut|hello|hi|السلام|مرحبا/.test(lower)) return "greeting";
  return "general";
}

function detectBacStream(input: string): StudentProfile["bacStream"] | undefined {
  const lower = input.toLowerCase();
  if (/sciences? math|sm\b|رياضيات/.test(lower)) return "sm";
  if (/physique?[\s-]?chimie|pc\b|فيزياء/.test(lower)) return "pc";
  if (/svt|sciences? vie|علوم حياة/.test(lower)) return "svt";
  if (/éco|économi|gestion|اقتصاد/.test(lower)) return "eco";
  if (/lettre|آداب|humanit/.test(lower)) return "lettres";
  return undefined;
}

function detectStyle(input: string): StudentProfile["preferredStyle"] | undefined {
  const lower = input.toLowerCase();
  if (/analytic|logique|math|تحليل|analytical/.test(lower)) return "analytical";
  if (/creat|art|design|إبداع/.test(lower)) return "creative";
  if (/social|aide|people|اجتماع|empath/.test(lower)) return "social";
  if (/practic|terrain|hands|عملي|bricol/.test(lower)) return "practical";
  return undefined;
}

function characterQuestion(locale: string, missing: "preferredStyle" | "bacStream"): AskData {
  if (missing === "bacStream") {
    return {
      profileKey: "bacStream",
      question:
        locale === "ar"
          ? "ما هي شعبتك في الباكالوريا؟"
          : locale === "en"
            ? "Which Bac stream are you in?"
            : "Quelle est ta filière de Bac ?",
      options: [
        { id: "sm", label: locale === "ar" ? "علوم رياضية" : locale === "en" ? "Math Sciences" : "Sciences Maths" },
        { id: "pc", label: locale === "ar" ? "فيزياء وكيمياء" : locale === "en" ? "Physics-Chemistry" : "Physique-Chimie" },
        { id: "svt", label: locale === "ar" ? "علوم الحياة والأرض" : locale === "en" ? "Life & Earth" : "SVT" },
        { id: "eco", label: locale === "ar" ? "اقتصاد وتدبير" : locale === "en" ? "Eco & Management" : "Éco & Gestion" },
        { id: "lettres", label: locale === "ar" ? "آداب" : locale === "en" ? "Humanities" : "Lettres" },
      ],
    };
  }
  return {
    profileKey: "preferredStyle",
    question:
      locale === "ar"
        ? "كيف تحب أن تتعلم وتعمل؟"
        : locale === "en"
          ? "How do you like to learn and work?"
          : "Comment aimes-tu apprendre et travailler ?",
    options: [
      { id: "analytical", label: locale === "ar" ? "أحلل وأحسب" : locale === "en" ? "I analyze and calculate" : "J'analyse et je calcule" },
      { id: "creative", label: locale === "ar" ? "أخلق وأتخيل" : locale === "en" ? "I create and imagine" : "Je crée et j'imagine" },
      { id: "social", label: locale === "ar" ? "أساعد وأتواصل" : locale === "en" ? "I help and connect" : "J'aide et je relie les gens" },
      { id: "practical", label: locale === "ar" ? "أجرب بيدي" : locale === "en" ? "I try things hands-on" : "J'apprends en faisant" },
    ],
  };
}

const FIELD_SCHOOLS: Record<string, string[]> = {
  "CPGE / Grandes Écoles": ["Lycée Mohammed V", "Lycée Moulay Youssef", "Lycée Ibn Timiya"],
  "ENSIAS / EMI Rabat": ["ENSIAS", "EMI", "INPT"],
  "UM6P Benguerir": ["UM6P", "1337", "UM6P School of Agriculture"],
  "AIAC Aéronautique": ["AIAC Casablanca"],
  "ENSA (Réseau Nat.)": ["ENSA Marrakech", "ENSA Tétouan", "ENSA Agadir"],
  "Faculté de Médecine": ["FMP Rabat", "FMP Casablanca", "FMP Marrakech"],
  "ENSAM Mécanique": ["ENSAM Casablanca", "ENSAM Meknès"],
  "FST Technologies": ["FST Marrakech", "FST Tanger"],
  "Médecine & Pharmacie": ["FMP", "FMPF", "FMD"],
  "IAV Hassan II (Agro)": ["IAV Rabat", "ENA Meknès"],
  "Biotechnologies": ["FST", "UM6P"],
  "Médecine Dentaire": ["FMD Rabat", "FMD Casablanca"],
  "ISCAE Casablanca": ["ISCAE Casa", "ISCAE Rabat"],
  "Réseau ENCG": ["ENCG Settat", "ENCG Tanger", "ENCG Agadir"],
  "Al Akhawayn Ifrane": ["AUI Ifrane"],
  "Droit des Affaires": ["FSJES Casablanca", "FSJES Rabat"],
  "Droit (FSJES)": ["FSJES", "Faculté de Droit"],
  "Journalisme & Médias": ["ISIC Rabat", "ESJC"],
  "Sciences Politiques": ["FSJES", "UM5"],
  "Langues & Traduction": ["Faculté des Lettres", "King Fahd School of Translation"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Response Generator
// ─────────────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuizFor(stream: string): QuizData {
  const bank = QUIZ_BANK[stream] ?? QUIZ_BANK.general;
  const general = QUIZ_BANK.general;
  const combined = [...bank, ...general];
  const shuffled = combined.sort(() => Math.random() - 0.5).slice(0, 4);
  return {
    title: `Quiz personnalisé — ${stream.toUpperCase()}`,
    focusArea: stream,
    questions: shuffled,
  };
}

const GENERAL_RESPONSES_FR: Record<string, string[]> = {
  greeting: [
    "Salam ! Ravi de te retrouver Comment puis-je t'aider aujourd'hui ? Tu veux un quiz, une analyse de profil, ou des conseils sur ta filière ?",
    "Bonjour ! Je suis Rafi, ton guide d'orientation IA. Qu'est-ce qui te passionne dans tes études en ce moment ?",
  ],
  general: [
    "C'est une excellente question ! Pour mieux te guider, dis-moi ta filière Bac et ce qui te passionne le plus dans tes études.",
    "Rafi note ta question 📝 Le choix de filière dépend beaucoup de ton profil. Veux-tu que je génère un quiz pour mieux te connaître ?",
    "Bonne réflexion ! L'orientation au Maroc est un parcours unique. As-tu déjà une idée de tes domaines de prédilection — ingénierie, santé, commerce, ou autre ?",
  ],
};

const GENERAL_RESPONSES_EN: Record<string, string[]> = {
  greeting: [
    "Hello! Great to see you How can I help you today? Want a quiz, profile analysis, or advice on your field?",
    "Hi! I'm Rafi, your AI orientation guide. What excites you most about your studies right now?",
  ],
  general: [
    "Great question! To guide you better, tell me your Bac stream and what you're most passionate about.",
    "Rafi is noting your question 📝 Your field choice depends a lot on your profile. Want me to generate a quiz to learn more about you?",
  ],
};

const GENERAL_RESPONSES_AR: Record<string, string[]> = {
  greeting: [
    "السلام! سعيد برؤيتك كيف يمكنني مساعدتك اليوم؟ هل تريد اختباراً، تحليل ملف، أو نصيحة حول شعبتك؟",
    "مرحباً! أنا رافي، مرشدك الذكي للتوجيه. ما الذي يثير اهتمامك أكثر في دراستك الآن؟",
  ],
  general: [
    "سؤال ممتاز! لأرشدك بشكل أفضل، أخبرني بشعبتك في الباكالوريا وما الذي تحبه أكثر.",
    "رافي يسجل سؤالك 📝 اختيار الشعبة يعتمد كثيراً على ملفك الشخصي. هل تريد أن أنشئ اختباراً لأعرفك أكثر؟",
  ],
};

const GENERAL_RESPONSES_ARY: Record<string, string[]> = {
  greeting: [
    "السلام عليكم! فرحان حيت شفتك، كيفاش نقدر نعاونك اليوم؟ باغي كويز، نحللو بروفيلك، ولا نصيحة على شعبتك؟",
    "أهلاً بيك! أنا رافي، رفيقك فالتوجيه. شنو هو المجال اللي عاجبك كتر ف قرايتك دابا؟",
  ],
  general: [
    "سؤال واعر بزاف! باش نعاونك مزيان، قولي شعبة الباك ديالك وشنو كيعجبك دير.",
    "رافي سجل سؤالك 📝 اختيار الشعبة كيعتمد بزاف على بروفيلك. واش نبين ليك كويز باش نتعرف عليك كتر؟",
  ],
};

export async function generateAgentResponse(
  userMessage: string,
  profile: StudentProfile,
  locale: string = "fr",
  history: ChatMessage[] = []
): Promise<{ message: ChatMessage; profile: StudentProfile }> {
  const intent = detectIntent(userMessage);
  const detectedStream = detectBacStream(userMessage);
  const detectedStyle = detectStyle(userMessage);
  const nextProfile: StudentProfile = {
    ...profile,
    bacStream: detectedStream ?? profile.bacStream,
    preferredStyle: detectedStyle ?? profile.preferredStyle,
  };
  const stream = nextProfile.bacStream ?? "general";
  const id = `rafi-${Date.now()}`;

  const askIfNeeded = (force = false): ChatMessage | null => {
    if (!force && nextProfile.bacStream && nextProfile.preferredStyle) return null;
    const missing: "bacStream" | "preferredStyle" = !nextProfile.bacStream ? "bacStream" : "preferredStyle";
    const ask = characterQuestion(locale, missing);
    const intro =
      locale === "ar"
        ? "لأرشدك بدقة، أحتاج أن أعرفك أكثر"
        : locale === "en"
          ? "To guide you well, I need to know you a bit better"
          : "Pour te guider précisément, j'ai besoin de mieux te connaître";
    return { id, role: "rafi", type: "ask", content: intro, data: ask, timestamp: new Date() };
  };

  // 1. Interactive UI widgets
  if (intent === "ask") {
    const message = askIfNeeded(true)!;
    return { message, profile: nextProfile };
  }

  if (intent === "quiz") {
    const quiz = generateQuizFor(stream);
    const quizLabel = locale === "ar" ? "حسناً! إليك اختبارك المخصص 🧪" : locale === "en" ? "Here's your personalized quiz! 🧪" : "Voici ton quiz personnalisé ! 🧪";
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "quiz", content: quizLabel, data: quiz, timestamp: new Date() },
    };
  }

  if (intent === "challenge") {
    const challenge = pick(CHALLENGES);
    const challengeLabel = locale === "ar" ? "إليك تحديك اليومي من رافي 🎯" : locale === "en" ? "Here's your Rafi challenge! 🎯" : "Voici ton défi Rafi ! 🎯";
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "challenge", content: challengeLabel, data: challenge, timestamp: new Date() },
    };
  }

  if (intent === "analyze") {
    const pending = askIfNeeded();
    if (pending) return { message: pending, profile: nextProfile };
    const analysis = analyzeProfile({ ...nextProfile, bacStream: stream as StudentProfile["bacStream"] });
    const analyzeLabel = locale === "ar" ? "إليك تحليل ملفك الشخصي 📊" : locale === "en" ? "Here's your profile analysis 📊" : "Voici l'analyse de ton profil 📊";
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "analysis", content: analyzeLabel, data: analysis, timestamp: new Date() },
    };
  }

  // 2. Call live Backend AI Agent (Google Gemini 3.5 Flash Lite)
  try {
    const recentHistory = history
      .slice(-6)
      .map((h) => ({
        role: (h.role === "rafi" ? "assistant" : "user") as "user" | "assistant",
        content: h.content,
      }));

    const response = await api.agent.chat({
      message: userMessage,
      history: recentHistory,
      profile: {
        bacStream: nextProfile.bacStream,
        preferredStyle: nextProfile.preferredStyle,
        locale,
      },
    });

    if (response?.reply && response.reply.trim().length > 0) {
      return {
        profile: nextProfile,
        message: {
          id,
          role: "rafi",
          type: "text",
          content: response.reply,
          timestamp: new Date(),
        },
      };
    }
  } catch (err) {
    console.warn("Backend chat unavailable, using local response fallback", err);
  }

  // 3. Fallback responses (Offline local pool)
  if (intent === "fields") {
    const pending = askIfNeeded();
    if (pending) return { message: pending, profile: nextProfile };
    const analysis = analyzeProfile({ ...nextProfile, bacStream: stream as StudentProfile["bacStream"] });
    const fieldLabel = locale === "ar" ? "إليك أفضل الشعب الموصى بها لك 🎓" : locale === "en" ? "Here are your top recommended fields 🎓" : "Voici tes filières recommandées 🎓";
    return {
      profile: nextProfile,
      message: {
        id, role: "rafi", type: "field-list", content: fieldLabel,
        data: {
          fields: analysis.recommendedFields.map((f) => ({
            name: f.name,
            description: `${locale === "ar" ? "التوافق" : locale === "en" ? "Match" : "Compatibilité"}: ${f.match}%`,
            schools: FIELD_SCHOOLS[f.name] ?? [],
            match: f.match,
          })),
        },
        timestamp: new Date(),
      },
    };
  }

  const responsePool = locale === "ary"
    ? (GENERAL_RESPONSES_ARY[intent] ?? GENERAL_RESPONSES_ARY.general)
    : locale === "ar"
    ? (GENERAL_RESPONSES_AR[intent] ?? GENERAL_RESPONSES_AR.general)
    : locale === "en"
    ? (GENERAL_RESPONSES_EN[intent] ?? GENERAL_RESPONSES_EN.general)
    : (GENERAL_RESPONSES_FR[intent] ?? GENERAL_RESPONSES_FR.general);

  return {
    profile: nextProfile,
    message: { id, role: "rafi", type: "text", content: pick(responsePool), timestamp: new Date() },
  };
}
