/**
 * Rafi9i — Rafi AI Agent Brain
 * Generates personalized quizzes, analyzes student profiles,
 * creates challenges, and holds smart orientation conversations.
 *
 * This is a frontend AI engine (no external API key required)
 * that simulates an intelligent agent using rule-based NLP + heuristics.
 * Replace the core `generateResponse()` with a real LLM call when ready.
 *
 * All user-visible content exists in the four UI locales (fr, en, ar, ary):
 * short labels are translation keys (lib/translations/content.ts), larger
 * structured content (quiz bank, challenges, fields) is kept per-locale here.
 */

import { api } from "./api";
import { translate, type Locale } from "./i18n";

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
  /** "locked" = Premium-only feature requested by a free user. */
  type?: "text" | "quiz" | "challenge" | "analysis" | "field-list" | "ask" | "locked";
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

type Localized<T> = Record<Locale, T>;

function toLocale(locale: string): Locale {
  return locale === "en" || locale === "ar" || locale === "ary" ? locale : "fr";
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Bank — same ids, same correct index in every locale
// ─────────────────────────────────────────────────────────────────────────────

type QuizBank = Record<string, QuizQuestion[]>;

const QUIZ_BANK: Localized<QuizBank> = {
  fr: {
    sm: [
      {
        id: "sm1", field: "Mathématiques",
        question: "Quelle est la dérivée de f(x) = x³ + 2x ?",
        options: ["f'(x) = 3x² + 2", "f'(x) = x² + 2", "f'(x) = 3x²", "f'(x) = 2x + 1"],
        correctIndex: 0,
        explanation: "La dérivée de xⁿ est n·xⁿ⁻¹, donc (x³)' = 3x² et (2x)' = 2.",
      },
      {
        id: "sm2", field: "Physique",
        question: "Un corps de masse 5 kg est soumis à une force de 20 N. Quelle est son accélération ?",
        options: ["4 m/s²", "100 m/s²", "0.25 m/s²", "25 m/s²"],
        correctIndex: 0,
        explanation: "F = ma → a = F/m = 20/5 = 4 m/s²",
      },
      {
        id: "sm3", field: "Logique",
        question: "Si tous les étudiants en CPGE travaillent dur, et Khalid est en CPGE, alors...",
        options: ["Khalid travaille dur", "Khalid est paresseux", "Khalid n'est pas étudiant", "On ne peut pas conclure"],
        correctIndex: 0,
        explanation: "Syllogisme logique : la prémisse s'applique à Khalid.",
      },
    ],
    pc: [
      {
        id: "pc1", field: "Chimie",
        question: "Quelle est la formule chimique de l'eau ?",
        options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
        correctIndex: 0,
        explanation: "L'eau est composée de 2 atomes d'hydrogène et 1 d'oxygène : H₂O.",
      },
      {
        id: "pc2", field: "Physique",
        question: "L'unité du courant électrique est :",
        options: ["Ampère (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"],
        correctIndex: 0,
        explanation: "L'ampère est l'unité SI de l'intensité du courant électrique.",
      },
    ],
    svt: [
      {
        id: "svt1", field: "Biologie",
        question: "Quel organite est responsable de la respiration cellulaire ?",
        options: ["La mitochondrie", "Le noyau", "Le ribosome", "Le réticulum endoplasmique"],
        correctIndex: 0,
        explanation: "La mitochondrie est le « moteur énergétique » de la cellule : elle produit l'ATP.",
      },
      {
        id: "svt2", field: "Génétique",
        question: "Combien de chromosomes possède une cellule humaine normale ?",
        options: ["46", "23", "92", "48"],
        correctIndex: 0,
        explanation: "L'être humain possède 46 chromosomes (23 paires) dans ses cellules somatiques.",
      },
    ],
    eco: [
      {
        id: "eco1", field: "Économie",
        question: "Le PIB mesure :",
        options: ["La valeur totale des biens et services produits dans un pays", "Le taux d'inflation", "Le chômage national", "La balance commerciale"],
        correctIndex: 0,
        explanation: "Le PIB (Produit Intérieur Brut) représente la valeur des biens et services produits.",
      },
      {
        id: "eco2", field: "Management",
        question: "Qu'est-ce que le marketing mix ?",
        options: ["Produit, Prix, Place, Promotion", "Profit, Plan, Performance, Prestige", "Part de marché, Prix, Personnel, Publicité", "Aucune de ces réponses"],
        correctIndex: 0,
        explanation: "Le marketing mix comprend les 4P : Produit, Prix, Place (distribution), Promotion.",
      },
    ],
    lettres: [
      {
        id: "let1", field: "Littérature",
        question: "Quel courant littéraire est associé à Victor Hugo ?",
        options: ["Le romantisme", "Le surréalisme", "Le naturalisme", "L'existentialisme"],
        correctIndex: 0,
        explanation: "Hugo est une figure majeure du romantisme français du XIXe siècle.",
      },
      {
        id: "let2", field: "Droit",
        question: "La Constitution marocaine de 2011 consacre notamment :",
        options: ["L'amazigh comme langue officielle", "Un régime présidentiel pur", "L'abolition du parlement", "Une monarchie élective"],
        correctIndex: 0,
        explanation: "L'amazigh est reconnu langue officielle aux côtés de l'arabe.",
      },
    ],
    general: [
      {
        id: "gen1", field: "Soft Skills",
        question: "Lors d'un travail en groupe difficile, quelle est la meilleure approche ?",
        options: ["Écouter chaque membre et chercher un consensus", "Imposer ton point de vue", "Laisser les autres décider seuls", "Éviter le conflit à tout prix"],
        correctIndex: 0,
        explanation: "L'écoute active et la recherche de consensus sont les piliers du leadership collaboratif.",
      },
      {
        id: "gen2", field: "Orientation",
        question: "Une Grande École marocaine reconnue pour l'ingénierie est :",
        options: ["ENSIAS Rabat", "ISCAE Casablanca", "IAV Hassan II", "Al Akhawayn"],
        correctIndex: 0,
        explanation: "L'ENSIAS (École Nationale Supérieure d'Informatique et d'Analyse des Systèmes) est l'une des meilleures écoles d'ingénieurs au Maroc.",
      },
    ],
  },
  en: {
    sm: [
      {
        id: "sm1", field: "Mathematics",
        question: "What is the derivative of f(x) = x³ + 2x?",
        options: ["f'(x) = 3x² + 2", "f'(x) = x² + 2", "f'(x) = 3x²", "f'(x) = 2x + 1"],
        correctIndex: 0,
        explanation: "The derivative of xⁿ is n·xⁿ⁻¹, so (x³)' = 3x² and (2x)' = 2.",
      },
      {
        id: "sm2", field: "Physics",
        question: "A 5 kg body is subjected to a 20 N force. What is its acceleration?",
        options: ["4 m/s²", "100 m/s²", "0.25 m/s²", "25 m/s²"],
        correctIndex: 0,
        explanation: "F = ma → a = F/m = 20/5 = 4 m/s²",
      },
      {
        id: "sm3", field: "Logic",
        question: "If all CPGE students work hard, and Khalid is in CPGE, then...",
        options: ["Khalid works hard", "Khalid is lazy", "Khalid is not a student", "No conclusion can be drawn"],
        correctIndex: 0,
        explanation: "A logical syllogism: the premise applies to Khalid.",
      },
    ],
    pc: [
      {
        id: "pc1", field: "Chemistry",
        question: "What is the chemical formula of water?",
        options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
        correctIndex: 0,
        explanation: "Water is made of 2 hydrogen atoms and 1 oxygen atom: H₂O.",
      },
      {
        id: "pc2", field: "Physics",
        question: "The unit of electric current is:",
        options: ["Ampere (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"],
        correctIndex: 0,
        explanation: "The ampere is the SI unit of electric current.",
      },
    ],
    svt: [
      {
        id: "svt1", field: "Biology",
        question: "Which organelle is responsible for cellular respiration?",
        options: ["The mitochondrion", "The nucleus", "The ribosome", "The endoplasmic reticulum"],
        correctIndex: 0,
        explanation: "The mitochondrion is the cell's \"powerhouse\": it produces ATP.",
      },
      {
        id: "svt2", field: "Genetics",
        question: "How many chromosomes does a normal human cell have?",
        options: ["46", "23", "92", "48"],
        correctIndex: 0,
        explanation: "Humans have 46 chromosomes (23 pairs) in their somatic cells.",
      },
    ],
    eco: [
      {
        id: "eco1", field: "Economics",
        question: "GDP measures:",
        options: ["The total value of goods and services produced in a country", "The inflation rate", "National unemployment", "The trade balance"],
        correctIndex: 0,
        explanation: "GDP (Gross Domestic Product) represents the value of the goods and services produced.",
      },
      {
        id: "eco2", field: "Management",
        question: "What is the marketing mix?",
        options: ["Product, Price, Place, Promotion", "Profit, Plan, Performance, Prestige", "Market share, Price, Personnel, Publicity", "None of these answers"],
        correctIndex: 0,
        explanation: "The marketing mix is made of the 4Ps: Product, Price, Place (distribution), Promotion.",
      },
    ],
    lettres: [
      {
        id: "let1", field: "Literature",
        question: "Which literary movement is associated with Victor Hugo?",
        options: ["Romanticism", "Surrealism", "Naturalism", "Existentialism"],
        correctIndex: 0,
        explanation: "Hugo is a major figure of 19th-century French Romanticism.",
      },
      {
        id: "let2", field: "Law",
        question: "Morocco's 2011 Constitution notably establishes:",
        options: ["Amazigh as an official language", "A purely presidential system", "The abolition of parliament", "An elective monarchy"],
        correctIndex: 0,
        explanation: "Amazigh is recognized as an official language alongside Arabic.",
      },
    ],
    general: [
      {
        id: "gen1", field: "Soft Skills",
        question: "During a difficult group project, what is the best approach?",
        options: ["Listen to every member and look for consensus", "Impose your point of view", "Let the others decide alone", "Avoid conflict at all costs"],
        correctIndex: 0,
        explanation: "Active listening and seeking consensus are the pillars of collaborative leadership.",
      },
      {
        id: "gen2", field: "Orientation",
        question: "A Moroccan Grande École renowned for engineering is:",
        options: ["ENSIAS Rabat", "ISCAE Casablanca", "IAV Hassan II", "Al Akhawayn"],
        correctIndex: 0,
        explanation: "ENSIAS (National School of Computer Science and Systems Analysis) is one of the best engineering schools in Morocco.",
      },
    ],
  },
  ar: {
    sm: [
      {
        id: "sm1", field: "الرياضيات",
        question: "ما هي مشتقة الدالة f(x) = x³ + 2x؟",
        options: ["f'(x) = 3x² + 2", "f'(x) = x² + 2", "f'(x) = 3x²", "f'(x) = 2x + 1"],
        correctIndex: 0,
        explanation: "مشتقة xⁿ هي n·xⁿ⁻¹، إذن (x³)' = 3x² و(2x)' = 2.",
      },
      {
        id: "sm2", field: "الفيزياء",
        question: "جسم كتلته 5 kg يخضع لقوة شدتها 20 N. ما هو تسارعه؟",
        options: ["4 m/s²", "100 m/s²", "0.25 m/s²", "25 m/s²"],
        correctIndex: 0,
        explanation: "F = ma → a = F/m = 20/5 = 4 m/s²",
      },
      {
        id: "sm3", field: "المنطق",
        question: "إذا كان جميع طلبة الأقسام التحضيرية (CPGE) يجتهدون، وكان خالد في CPGE، فإن...",
        options: ["خالد يجتهد", "خالد كسول", "خالد ليس طالباً", "لا يمكن الاستنتاج"],
        correctIndex: 0,
        explanation: "قياس منطقي: المقدمة تنطبق على خالد.",
      },
    ],
    pc: [
      {
        id: "pc1", field: "الكيمياء",
        question: "ما هي الصيغة الكيميائية للماء؟",
        options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
        correctIndex: 0,
        explanation: "يتكون الماء من ذرتي هيدروجين وذرة أكسجين واحدة: H₂O.",
      },
      {
        id: "pc2", field: "الفيزياء",
        question: "وحدة شدة التيار الكهربائي هي:",
        options: ["الأمبير (A)", "الفولت (V)", "الأوم (Ω)", "الواط (W)"],
        correctIndex: 0,
        explanation: "الأمبير هو وحدة شدة التيار الكهربائي في النظام الدولي للوحدات.",
      },
    ],
    svt: [
      {
        id: "svt1", field: "علم الأحياء",
        question: "أي عضية مسؤولة عن التنفس الخلوي؟",
        options: ["الميتوكوندري", "النواة", "الريبوسوم", "الشبكة الإندوبلازمية"],
        correctIndex: 0,
        explanation: "الميتوكوندري هي «محطة الطاقة» في الخلية: تنتج الـATP.",
      },
      {
        id: "svt2", field: "علم الوراثة",
        question: "كم عدد الصبغيات في خلية بشرية عادية؟",
        options: ["46", "23", "92", "48"],
        correctIndex: 0,
        explanation: "يمتلك الإنسان 46 صبغياً (23 زوجاً) في خلاياه الجسدية.",
      },
    ],
    eco: [
      {
        id: "eco1", field: "الاقتصاد",
        question: "الناتج الداخلي الإجمالي يقيس:",
        options: ["القيمة الإجمالية للسلع والخدمات المنتجة في بلد ما", "معدل التضخم", "البطالة الوطنية", "الميزان التجاري"],
        correctIndex: 0,
        explanation: "الناتج الداخلي الإجمالي (PIB) يمثل قيمة السلع والخدمات المنتجة.",
      },
      {
        id: "eco2", field: "التدبير",
        question: "ما هو المزيج التسويقي (marketing mix)؟",
        options: ["المنتج، السعر، التوزيع، الترويج", "الربح، الخطة، الأداء، المكانة", "الحصة السوقية، السعر، الموظفون، الإشهار", "لا شيء مما سبق"],
        correctIndex: 0,
        explanation: "يتكون المزيج التسويقي من العناصر الأربعة (4P): المنتج، السعر، التوزيع، الترويج.",
      },
    ],
    lettres: [
      {
        id: "let1", field: "الأدب",
        question: "أي تيار أدبي يرتبط بفيكتور هوغو؟",
        options: ["الرومانسية", "السريالية", "الطبيعية", "الوجودية"],
        correctIndex: 0,
        explanation: "هوغو من أبرز رموز الرومانسية الفرنسية في القرن التاسع عشر.",
      },
      {
        id: "let2", field: "القانون",
        question: "من أبرز ما كرّسه دستور المغرب لسنة 2011:",
        options: ["الأمازيغية لغة رسمية", "نظام رئاسي خالص", "إلغاء البرلمان", "ملكية انتخابية"],
        correctIndex: 0,
        explanation: "الأمازيغية معترف بها لغة رسمية إلى جانب العربية.",
      },
    ],
    general: [
      {
        id: "gen1", field: "المهارات الناعمة",
        question: "خلال عمل جماعي صعب، ما هو أفضل أسلوب؟",
        options: ["الإصغاء لكل عضو والبحث عن توافق", "فرض وجهة نظرك", "ترك الآخرين يقررون وحدهم", "تجنب الخلاف بأي ثمن"],
        correctIndex: 0,
        explanation: "الإصغاء الفعّال والبحث عن التوافق هما ركيزتا القيادة التشاركية.",
      },
      {
        id: "gen2", field: "التوجيه",
        question: "من المدارس العليا المغربية المعروفة في الهندسة:",
        options: ["ENSIAS الرباط", "ISCAE الدار البيضاء", "IAV الحسن الثاني", "الأخوين"],
        correctIndex: 0,
        explanation: "المدرسة الوطنية العليا للمعلوميات وتحليل النظم (ENSIAS) من أفضل مدارس الهندسة في المغرب.",
      },
    ],
  },
  ary: {
    sm: [
      {
        id: "sm1", field: "الرياضيات",
        question: "شنو هي المشتقة ديال f(x) = x³ + 2x؟",
        options: ["f'(x) = 3x² + 2", "f'(x) = x² + 2", "f'(x) = 3x²", "f'(x) = 2x + 1"],
        correctIndex: 0,
        explanation: "المشتقة ديال xⁿ هي n·xⁿ⁻¹، يعني (x³)' = 3x² و(2x)' = 2.",
      },
      {
        id: "sm2", field: "الفيزيك",
        question: "جسم الكتلة ديالو 5 kg، كتأثر عليه قوة ديال 20 N. شحال هو التسارع ديالو؟",
        options: ["4 m/s²", "100 m/s²", "0.25 m/s²", "25 m/s²"],
        correctIndex: 0,
        explanation: "F = ma → a = F/m = 20/5 = 4 m/s²",
      },
      {
        id: "sm3", field: "المنطق",
        question: "إلا كانو كاع الطلبة ديال CPGE كيخدمو بزاف، وخالد فـCPGE، إذن...",
        options: ["خالد كيخدم بزاف", "خالد كسول", "خالد ماشي طالب", "ما نقدروش نستنتجو والو"],
        correctIndex: 0,
        explanation: "قياس منطقي: القاعدة كتطبق على خالد.",
      },
    ],
    pc: [
      {
        id: "pc1", field: "الكيمياء",
        question: "شنو هي الصيغة الكيميائية ديال الما؟",
        options: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
        correctIndex: 0,
        explanation: "الما فيه جوج ذرات ديال الهيدروجين وذرة وحدة ديال الأكسجين: H₂O.",
      },
      {
        id: "pc2", field: "الفيزيك",
        question: "الوحدة ديال شدة التيار الكهربائي هي:",
        options: ["الأمبير (A)", "الفولت (V)", "الأوم (Ω)", "الواط (W)"],
        correctIndex: 0,
        explanation: "الأمبير هو الوحدة الدولية ديال شدة التيار الكهربائي.",
      },
    ],
    svt: [
      {
        id: "svt1", field: "البيولوجيا",
        question: "شمن عضية مسؤولة على التنفس الخلوي؟",
        options: ["الميتوكوندري", "النواة", "الريبوسوم", "الشبكة الإندوبلازمية"],
        correctIndex: 0,
        explanation: "الميتوكوندري هي «الموتور» ديال الخلية: هي اللي كتنتج الـATP.",
      },
      {
        id: "svt2", field: "علم الوراثة",
        question: "شحال من صبغي كاين فخلية بشرية عادية؟",
        options: ["46", "23", "92", "48"],
        correctIndex: 0,
        explanation: "بنادم عندو 46 صبغي (23 زوج) فالخلايا الجسدية ديالو.",
      },
    ],
    eco: [
      {
        id: "eco1", field: "الاقتصاد",
        question: "الناتج الداخلي الخام (PIB) كيقيس:",
        options: ["القيمة الكاملة ديال السلع والخدمات اللي كتنتج فبلاد", "نسبة التضخم", "البطالة فالبلاد", "الميزان التجاري"],
        correctIndex: 0,
        explanation: "الـPIB كيمثل القيمة ديال السلع والخدمات اللي تنتجات.",
      },
      {
        id: "eco2", field: "التسيير",
        question: "شنو هو الماركتينغ ميكس؟",
        options: ["المنتوج، الثمن، التوزيع، الترويج", "الربح، الخطة، الأداء، البريستيج", "حصة السوق، الثمن، الخدامة، الإشهار", "حتى وحدة من هادو"],
        correctIndex: 0,
        explanation: "الماركتينغ ميكس فيه 4P: المنتوج، الثمن، التوزيع، الترويج.",
      },
    ],
    lettres: [
      {
        id: "let1", field: "الأدب",
        question: "شمن تيار أدبي مرتبط بفيكتور هوغو؟",
        options: ["الرومانسية", "السريالية", "الطبيعية", "الوجودية"],
        correctIndex: 0,
        explanation: "هوغو من أكبر الوجوه ديال الرومانسية الفرنسية فالقرن 19.",
      },
      {
        id: "let2", field: "الحقوق",
        question: "دستور المغرب ديال 2011 من بين الحوايج اللي جاب:",
        options: ["الأمازيغية لغة رسمية", "نظام رئاسي خالص", "حيد البرلمان", "ملكية بالانتخاب"],
        correctIndex: 0,
        explanation: "الأمازيغية ولات لغة رسمية حدا العربية.",
      },
    ],
    general: [
      {
        id: "gen1", field: "السوفت سكيلز",
        question: "فخدمة جماعية صعيبة، شنو هي أحسن طريقة؟",
        options: ["تسمع لكل واحد وتقلب على اتفاق", "تفرض الرأي ديالك", "تخلي الآخرين يقررو بوحدهم", "تهرب من المشاكل كيف ما كان"],
        correctIndex: 0,
        explanation: "تسمع مزيان وتقلب على اتفاق، هادو هوما الأساس ديال القيادة الجماعية.",
      },
      {
        id: "gen2", field: "التوجيه",
        question: "مدرسة عليا مغربية معروفة فالهندسة هي:",
        options: ["ENSIAS الرباط", "ISCAE كازا", "IAV الحسن الثاني", "الأخوين"],
        correctIndex: 0,
        explanation: "ENSIAS (المدرسة الوطنية العليا للمعلوميات وتحليل النظم) من أحسن مدارس المهندسين فالمغرب.",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Challenge Bank — same order, xp and difficulty in every locale
// ─────────────────────────────────────────────────────────────────────────────

const CHALLENGES: Localized<ChallengeData[]> = {
  fr: [
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
        "Écris une lettre de motivation fictive pour l'ISCAE",
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
        "Interviewe (en ligne) un professionnel de la santé",
        "Compare les débouchés de l'ENSA et de l'ENSIAS",
      ],
      timeframe: "7 jours",
      xp: 80,
      difficulty: "facile",
    },
  ],
  en: [
    {
      title: "CPGE entrance exam prep",
      description: "Practice math exercises at preparatory-class level",
      tasks: [
        "Solve 5 exercises on sequences and series",
        "Write a physics essay on kinematics",
        "Summarize a linear algebra chapter",
      ],
      timeframe: "3 days",
      xp: 150,
      difficulty: "difficile",
    },
    {
      title: "Build your leadership",
      description: "A soft skills challenge to prepare you for admission interviews",
      tasks: [
        "Give a 5-minute talk on a topic of your choice",
        "Organize a study session with 2 friends",
        "Write a mock cover letter for ISCAE",
      ],
      timeframe: "5 days",
      xp: 100,
      difficulty: "moyen",
    },
    {
      title: "Discover STEM careers",
      description: "Explore 3 careers in science and technology",
      tasks: [
        "Research and summarize the role of a software engineer in Morocco",
        "Interview (online) a health professional",
        "Compare career prospects after ENSA and ENSIAS",
      ],
      timeframe: "7 days",
      xp: 80,
      difficulty: "facile",
    },
  ],
  ar: [
    {
      title: "التحضير لمباراة الأقسام التحضيرية",
      description: "تدرّب على تمارين رياضيات بمستوى الأقسام التحضيرية (CPGE)",
      tasks: [
        "حلّ 5 تمارين حول المتتاليات والمتسلسلات",
        "اكتب موضوعاً في الفيزياء حول علم الحركة",
        "لخّص فصلاً من الجبر الخطي",
      ],
      timeframe: "3 أيام",
      xp: 150,
      difficulty: "difficile",
    },
    {
      title: "طوّر قدرتك على القيادة",
      description: "تحدٍّ في المهارات الناعمة يهيّئك لمقابلات القبول",
      tasks: [
        "قدّم عرضاً مدته 5 دقائق حول موضوع من اختيارك",
        "نظّم حصة مراجعة مع صديقين",
        "اكتب رسالة تحفيز تجريبية لـISCAE",
      ],
      timeframe: "5 أيام",
      xp: 100,
      difficulty: "moyen",
    },
    {
      title: "اكتشاف مهن العلوم والتكنولوجيا",
      description: "استكشف 3 مهن في المجالات العلمية والتكنولوجية",
      tasks: [
        "ابحث ولخّص دور مهندس المعلوميات في المغرب",
        "أجرِ مقابلة (عن بُعد) مع مهني في قطاع الصحة",
        "قارن آفاق الشغل بعد ENSA وENSIAS",
      ],
      timeframe: "7 أيام",
      xp: 80,
      difficulty: "facile",
    },
  ],
  ary: [
    {
      title: "وجد راسك لكونكور CPGE",
      description: "تمرن على تمارين ديال الماط بمستوى الأقسام التحضيرية",
      tasks: [
        "حل 5 تمارين على المتتاليات والسلاسل",
        "كتب ديسيرتاسيون فالفيزيك على الحركة",
        "دير ملخص لشي فصل من الجبر الخطي",
      ],
      timeframe: "3 أيام",
      xp: 150,
      difficulty: "difficile",
    },
    {
      title: "طور القيادة ديالك",
      description: "تحدي ديال السوفت سكيلز باش توجد راسك للمقابلات ديال القبول",
      tasks: [
        "دير عرض ديال 5 دقايق على موضوع اللي بغيتي",
        "نظم جلسة ديال المراجعة مع جوج صحابك",
        "كتب لاتر دو موتيفاسيون تجريبية لـISCAE",
      ],
      timeframe: "5 أيام",
      xp: 100,
      difficulty: "moyen",
    },
    {
      title: "اكتشف المهن ديال STEM",
      description: "اكتشف 3 مهن فالعلوم والتكنولوجيا",
      tasks: [
        "قلب ولخص شنو كيدير مهندس المعلوميات فالمغرب",
        "دير مقابلة (أونلاين) مع شي واحد خدام فالصحة",
        "قارن الفرص ديال الخدمة من بعد ENSA وENSIAS",
      ],
      timeframe: "7 أيام",
      xp: 80,
      difficulty: "facile",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Profile Analysis Engine
// ─────────────────────────────────────────────────────────────────────────────

/** Recommended fields per stream. `id` (French name) drives schools + style tweaks. */
const FIELD_MAP: Record<string, { id: string; match: number; color: string; emoji: string }[]> = {
  sm: [
    { id: "CPGE / Grandes Écoles", match: 95, color: "#f88541", emoji: "🏆" },
    { id: "ENSIAS / EMI Rabat",    match: 90, color: "#a9894b", emoji: "💻" },
    { id: "UM6P Benguerir",        match: 87, color: "#0284c7", emoji: "🔬" },
    { id: "AIAC Aéronautique",     match: 82, color: "#7c3aed", emoji: "✈️" },
  ],
  pc: [
    { id: "ENSA (Réseau Nat.)",    match: 92, color: "#0284c7", emoji: "⚙️" },
    { id: "Faculté de Médecine",   match: 88, color: "#059669", emoji: "🏥" },
    { id: "ENSAM Mécanique",       match: 84, color: "#f88541", emoji: "🔧" },
    { id: "FST Technologies",      match: 79, color: "#7c3aed", emoji: "🧪" },
  ],
  svt: [
    { id: "Médecine & Pharmacie",  match: 96, color: "#059669", emoji: "🏥" },
    { id: "IAV Hassan II (Agro)",  match: 90, color: "#16a34a", emoji: "🌱" },
    { id: "Biotechnologies",       match: 85, color: "#0284c7", emoji: "🧬" },
    { id: "Médecine Dentaire",     match: 80, color: "#7c3aed", emoji: "😁" },
  ],
  eco: [
    { id: "ISCAE Casablanca",      match: 94, color: "#7c3aed", emoji: "📈" },
    { id: "Réseau ENCG",           match: 90, color: "#f88541", emoji: "🏢" },
    { id: "Al Akhawayn Ifrane",    match: 86, color: "#0284c7", emoji: "🌍" },
    { id: "Droit des Affaires",    match: 78, color: "#059669", emoji: "⚖️" },
  ],
  lettres: [
    { id: "Droit (FSJES)",         match: 93, color: "#7c3aed", emoji: "⚖️" },
    { id: "Journalisme & Médias",  match: 88, color: "#f88541", emoji: "📰" },
    { id: "Sciences Politiques",   match: 84, color: "#0284c7", emoji: "🏛️" },
    { id: "Langues & Traduction",  match: 80, color: "#059669", emoji: "🗣️" },
  ],
};

/** Display names of recommended fields (French names are the ids). */
const FIELD_NAMES: Record<Exclude<Locale, "fr">, Record<string, string>> = {
  en: {
    "CPGE / Grandes Écoles": "CPGE / Grandes Écoles",
    "ENSIAS / EMI Rabat": "ENSIAS / EMI Rabat",
    "UM6P Benguerir": "UM6P Benguerir",
    "AIAC Aéronautique": "AIAC Aeronautics",
    "ENSA (Réseau Nat.)": "ENSA (National Network)",
    "Faculté de Médecine": "Faculty of Medicine",
    "ENSAM Mécanique": "ENSAM Mechanical Engineering",
    "FST Technologies": "FST Technology",
    "Médecine & Pharmacie": "Medicine & Pharmacy",
    "IAV Hassan II (Agro)": "IAV Hassan II (Agronomy)",
    "Biotechnologies": "Biotechnology",
    "Médecine Dentaire": "Dentistry",
    "ISCAE Casablanca": "ISCAE Casablanca",
    "Réseau ENCG": "ENCG Network",
    "Al Akhawayn Ifrane": "Al Akhawayn Ifrane",
    "Droit des Affaires": "Business Law",
    "Droit (FSJES)": "Law (FSJES)",
    "Journalisme & Médias": "Journalism & Media",
    "Sciences Politiques": "Political Science",
    "Langues & Traduction": "Languages & Translation",
  },
  ar: {
    "CPGE / Grandes Écoles": "الأقسام التحضيرية / المدارس العليا",
    "ENSIAS / EMI Rabat": "ENSIAS / EMI الرباط",
    "UM6P Benguerir": "UM6P بنجرير",
    "AIAC Aéronautique": "AIAC للطيران",
    "ENSA (Réseau Nat.)": "ENSA (الشبكة الوطنية)",
    "Faculté de Médecine": "كلية الطب",
    "ENSAM Mécanique": "ENSAM الهندسة الميكانيكية",
    "FST Technologies": "FST العلوم والتقنيات",
    "Médecine & Pharmacie": "الطب والصيدلة",
    "IAV Hassan II (Agro)": "IAV الحسن الثاني (الزراعة)",
    "Biotechnologies": "التكنولوجيا الحيوية",
    "Médecine Dentaire": "طب الأسنان",
    "ISCAE Casablanca": "ISCAE الدار البيضاء",
    "Réseau ENCG": "شبكة ENCG",
    "Al Akhawayn Ifrane": "جامعة الأخوين بإفران",
    "Droit des Affaires": "قانون الأعمال",
    "Droit (FSJES)": "الحقوق (FSJES)",
    "Journalisme & Médias": "الصحافة والإعلام",
    "Sciences Politiques": "العلوم السياسية",
    "Langues & Traduction": "اللغات والترجمة",
  },
  ary: {
    "CPGE / Grandes Écoles": "الأقسام التحضيرية / المدارس الكبرى",
    "ENSIAS / EMI Rabat": "ENSIAS / EMI الرباط",
    "UM6P Benguerir": "UM6P بنجرير",
    "AIAC Aéronautique": "AIAC ديال الطيران",
    "ENSA (Réseau Nat.)": "ENSA (الشبكة الوطنية)",
    "Faculté de Médecine": "كلية الطب",
    "ENSAM Mécanique": "ENSAM الميكانيك",
    "FST Technologies": "FST التكنولوجيا",
    "Médecine & Pharmacie": "الطب والصيدلة",
    "IAV Hassan II (Agro)": "IAV الحسن الثاني (الفلاحة)",
    "Biotechnologies": "البيوتكنولوجيا",
    "Médecine Dentaire": "طب السنان",
    "ISCAE Casablanca": "ISCAE كازا",
    "Réseau ENCG": "شبكة ENCG",
    "Al Akhawayn Ifrane": "الأخوين إفران",
    "Droit des Affaires": "قانون الأعمال",
    "Droit (FSJES)": "الحقوق (FSJES)",
    "Journalisme & Médias": "الصحافة والإعلام",
    "Sciences Politiques": "العلوم السياسية",
    "Langues & Traduction": "اللغات والترجمة",
  },
};

function fieldName(id: string, locale: Locale): string {
  return locale === "fr" ? id : FIELD_NAMES[locale][id] ?? id;
}

const STRENGTH_SCORES: Record<string, { score: number; color: string }[]> = {
  sm: [
    { score: 92, color: "#f88541" },
    { score: 88, color: "#a9894b" },
    { score: 84, color: "#0284c7" },
    { score: 80, color: "#7c3aed" },
  ],
  pc: [
    { score: 90, color: "#0284c7" },
    { score: 86, color: "#f88541" },
    { score: 82, color: "#059669" },
    { score: 78, color: "#7c3aed" },
  ],
  svt: [
    { score: 94, color: "#059669" },
    { score: 88, color: "#16a34a" },
    { score: 84, color: "#0284c7" },
    { score: 90, color: "#f88541" },
  ],
  eco: [
    { score: 92, color: "#7c3aed" },
    { score: 88, color: "#f88541" },
    { score: 86, color: "#0284c7" },
    { score: 82, color: "#059669" },
  ],
  lettres: [
    { score: 94, color: "#7c3aed" },
    { score: 90, color: "#0284c7" },
    { score: 86, color: "#059669" },
    { score: 88, color: "#f88541" },
  ],
};

/** Strength labels, in the same order as STRENGTH_SCORES. */
const STRENGTH_LABELS: Localized<Record<string, string[]>> = {
  fr: {
    sm: ["Raisonnement logique", "Résolution de problèmes", "Rigueur scientifique", "Pensée abstraite"],
    pc: ["Expérimentation", "Analyse quantitative", "Curiosité scientifique", "Méthode rigoureuse"],
    svt: ["Empathie naturelle", "Observation fine", "Mémoire visuelle", "Esprit de service"],
    eco: ["Vision stratégique", "Leadership naturel", "Communication", "Gestion de projet"],
    lettres: ["Expression écrite", "Esprit critique", "Empathie culturelle", "Argumentation"],
  },
  en: {
    sm: ["Logical reasoning", "Problem solving", "Scientific rigor", "Abstract thinking"],
    pc: ["Experimentation", "Quantitative analysis", "Scientific curiosity", "Rigorous method"],
    svt: ["Natural empathy", "Keen observation", "Visual memory", "Service mindset"],
    eco: ["Strategic vision", "Natural leadership", "Communication", "Project management"],
    lettres: ["Written expression", "Critical thinking", "Cultural empathy", "Argumentation"],
  },
  ar: {
    sm: ["الاستدلال المنطقي", "حل المشكلات", "الدقة العلمية", "التفكير المجرد"],
    pc: ["التجريب", "التحليل الكمي", "الفضول العلمي", "المنهجية الدقيقة"],
    svt: ["التعاطف الفطري", "دقة الملاحظة", "الذاكرة البصرية", "روح الخدمة"],
    eco: ["الرؤية الاستراتيجية", "القيادة الفطرية", "التواصل", "تدبير المشاريع"],
    lettres: ["التعبير الكتابي", "الحس النقدي", "التعاطف الثقافي", "الحجاج"],
  },
  ary: {
    sm: ["التفكير المنطقي", "حل المشاكل", "الدقة العلمية", "التفكير المجرد"],
    pc: ["التجريب", "التحليل بالأرقام", "الفضول العلمي", "طريقة خدمة دقيقة"],
    svt: ["الحنان والتعاطف", "الملاحظة الدقيقة", "الذاكرة البصرية", "حب المساعدة"],
    eco: ["النظرة الاستراتيجية", "القيادة", "التواصل", "تسيير المشاريع"],
    lettres: ["الكتابة", "الحس النقدي", "الانفتاح الثقافي", "الإقناع بالحجة"],
  },
};

function analyzeProfile(profile: StudentProfile, locale: Locale): AnalysisData {
  const stream = profile.bacStream ?? "general";
  const fieldStream = FIELD_MAP[stream] ? stream : "sm";
  const strengthStream = STRENGTH_SCORES[stream] ? stream : "sm";
  const personalityStream = stream in FIELD_MAP ? stream : "general";

  let fields = FIELD_MAP[fieldStream];
  if (profile.preferredStyle === "creative") {
    fields = [...fields].sort((a, b) => (b.id.includes("Média") || b.id.includes("Design") ? 1 : 0) - (a.id.includes("Média") || a.id.includes("Design") ? 1 : 0));
    fields = fields.map((f, i) => ({ ...f, match: Math.min(99, f.match + (i === 0 ? 3 : 0)) }));
  } else if (profile.preferredStyle === "social") {
    fields = fields.map((f) =>
      /Santé|Médecine|Droit|ENCG|ISCAE/.test(f.id) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  } else if (profile.preferredStyle === "practical") {
    fields = fields.map((f) =>
      /ENSA|ENSAM|FST|Agro/.test(f.id) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  } else if (profile.preferredStyle === "analytical") {
    fields = fields.map((f) =>
      /CPGE|ENSIAS|UM6P|ISCAE/.test(f.id) ? { ...f, match: Math.min(99, f.match + 4) } : f
    ).sort((a, b) => b.match - a.match);
  }

  const labels = STRENGTH_LABELS[locale][strengthStream];
  return {
    strengths: STRENGTH_SCORES[strengthStream].map((s, i) => ({ label: labels[i], ...s })),
    recommendedFields: fields.map(({ id, ...rest }) => ({ name: fieldName(id, locale), ...rest })),
    personalityType: translate(locale, `cnt.agent.personality.${personalityStream}`),
    tip: translate(locale, `cnt.agent.tip.${personalityStream}`),
  };
}

/** Field ids (French names) of the recommended fields, in display order. */
function recommendedFieldIds(profile: StudentProfile): { id: string; match: number }[] {
  // French names are the ids, so the French analysis gives ids in display order.
  return analyzeProfile(profile, "fr").recommendedFields.map((f) => ({ id: f.name, match: f.match }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection — understands the quick-action labels of all 4 locales
// ─────────────────────────────────────────────────────────────────────────────

type Intent = "quiz" | "challenge" | "analyze" | "fields" | "greeting" | "ask" | "general";

function detectIntent(input: string): Intent {
  const lower = input.toLowerCase();
  if (/quiz|test|examen|exercice|اختبار|كويز/.test(lower)) return "quiz";
  if (/défi|challenge|mission|tâche|تحدي/.test(lower)) return "challenge";
  if (/analys|analyz|profil|connaître|point fort|faiblesse|تحليل|ملف|حلل|بروفيل/.test(lower)) return "analyze";
  if (/filière|école|université|formation|étude|field|school|universit|شعب|جامعة|مدرسة|مدارس|تناسبني/.test(lower)) return "fields";
  if (/questionne-moi|ask me|conna[iî]s[- ]moi|اسألني|سولني|who am i|mon caract/.test(lower)) return "ask";
  if (/bonjour|salam|salut|hello|hi|السلام|مرحبا|أهلا|اهلا/.test(lower)) return "greeting";
  return "general";
}

function detectBacStream(input: string): StudentProfile["bacStream"] | undefined {
  const lower = input.toLowerCase();
  if (/sciences? math|math sciences|sm\b|رياضيات|رياضية/.test(lower)) return "sm";
  if (/physique?[\s-]?chimie|physics|pc\b|فيزياء|فيزيائية/.test(lower)) return "pc";
  if (/svt|sciences? vie|life & earth|علوم حياة|علوم الحياة/.test(lower)) return "svt";
  if (/éco|économi|econom|gestion|اقتصاد/.test(lower)) return "eco";
  if (/lettre|humanit|آداب/.test(lower)) return "lettres";
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

const STREAM_IDS = ["sm", "pc", "svt", "eco", "lettres"] as const;
const STYLE_IDS = ["analytical", "creative", "social", "practical"] as const;

function characterQuestion(locale: Locale, missing: "preferredStyle" | "bacStream"): AskData {
  if (missing === "bacStream") {
    return {
      profileKey: "bacStream",
      question: translate(locale, "cnt.agent.ask.bacStream"),
      options: STREAM_IDS.map((id) => ({ id, label: translate(locale, `cnt.agent.ask.stream.${id}`) })),
    };
  }
  return {
    profileKey: "preferredStyle",
    question: translate(locale, "cnt.agent.ask.style"),
    options: STYLE_IDS.map((id) => ({ id, label: translate(locale, `cnt.agent.ask.style.${id}`) })),
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

function generateQuizFor(stream: string, locale: Locale): QuizData {
  const banks = QUIZ_BANK[locale];
  const bank = banks[stream] ?? banks.general;
  const general = banks.general;
  const combined = [...bank, ...general];
  const shuffled = combined.sort(() => Math.random() - 0.5).slice(0, 4);
  const streamLabel = (STREAM_IDS as readonly string[]).includes(stream)
    ? translate(locale, `cnt.agent.ask.stream.${stream}`)
    : translate(locale, "cnt.agent.quizStream.general");
  return {
    title: translate(locale, "cnt.agent.quizTitle", { stream: streamLabel }),
    focusArea: stream,
    questions: shuffled,
  };
}

/** Offline fallback replies (used when the backend chat is unavailable). */
const GENERAL_RESPONSES: Localized<Record<"greeting" | "general", string[]>> = {
  fr: {
    greeting: [
      "Salam ! Ravi de te retrouver. Comment puis-je t'aider aujourd'hui ? Tu veux un quiz, une analyse de profil, ou des conseils sur ta filière ?",
      "Bonjour ! Je suis Rafi, ton guide d'orientation IA. Qu'est-ce qui te passionne dans tes études en ce moment ?",
    ],
    general: [
      "C'est une excellente question ! Pour mieux te guider, dis-moi ta filière Bac et ce qui te passionne le plus dans tes études.",
      "Rafi note ta question 📝 Le choix de filière dépend beaucoup de ton profil. Veux-tu que je génère un quiz pour mieux te connaître ?",
      "Bonne réflexion ! L'orientation au Maroc est un parcours unique. As-tu déjà une idée de tes domaines de prédilection — ingénierie, santé, commerce, ou autre ?",
    ],
  },
  en: {
    greeting: [
      "Hello! Great to see you again. How can I help you today? Want a quiz, a profile analysis, or advice on your field?",
      "Hi! I'm Rafi, your AI orientation guide. What excites you most about your studies right now?",
    ],
    general: [
      "Great question! To guide you better, tell me your Bac stream and what you're most passionate about in your studies.",
      "Rafi is noting your question 📝 Your choice of field depends a lot on your profile. Want me to generate a quiz to get to know you better?",
      "Good thinking! Orientation in Morocco is a unique journey. Do you already have favorite areas in mind — engineering, health, business, or something else?",
    ],
  },
  ar: {
    greeting: [
      "السلام! سعيد بلقائك من جديد. كيف يمكنني مساعدتك اليوم؟ هل تريد اختباراً، أو تحليلاً لملفك، أو نصيحة حول شعبتك؟",
      "مرحباً! أنا رافي، مرشدك الذكي في التوجيه. ما الذي يثير شغفك أكثر في دراستك حالياً؟",
    ],
    general: [
      "سؤال ممتاز! لأرشدك بشكل أفضل، أخبرني بشعبتك في الباكالوريا وما الذي تحبه أكثر في دراستك.",
      "رافي يسجّل سؤالك 📝 اختيار الشعبة يعتمد كثيراً على ملفك الشخصي. هل تريد أن أُنشئ لك اختباراً لأتعرّف عليك أكثر؟",
      "تفكير في محله! التوجيه في المغرب مسار فريد. هل لديك فكرة عن المجالات التي تفضّلها — الهندسة، الصحة، التجارة، أو غيرها؟",
    ],
  },
  ary: {
    greeting: [
      "السلام عليكم! فرحان حيت شفتك، كيفاش نقدر نعاونك اليوم؟ باغي كويز، نحللو البروفيل ديالك، ولا نصيحة على الشعبة ديالك؟",
      "أهلاً بيك! أنا رافي، رفيقك فالتوجيه. شنو هو المجال اللي عاجبك كتر فالقراية ديالك دابا؟",
    ],
    general: [
      "سؤال واعر بزاف! باش نعاونك مزيان، قولي شعبة الباك ديالك وشنو كيعجبك كتر فالقراية.",
      "رافي سجل السؤال ديالك 📝 اختيار الشعبة كيعتمد بزاف على البروفيل ديالك. واش نوجد ليك كويز باش نتعرف عليك كتر؟",
      "فكرة مزيانة! التوجيه فالمغرب طريق خاصة. واش عندك شي فكرة على المجالات اللي كتبغي — الهندسة، الصحة، التجارة، ولا شي حاجة أخرى؟",
    ],
  },
};

/** Free users may only take the AI quiz; every other agent feature is Premium. */
export function isFreeAgentRequest(userMessage: string): boolean {
  return detectIntent(userMessage) === "quiz";
}

export async function generateAgentResponse(
  userMessage: string,
  profile: StudentProfile,
  locale: string = "fr",
  history: ChatMessage[] = [],
  options: { lockedMessage?: string } = {}
): Promise<{ message: ChatMessage; profile: StudentProfile }> {
  const intent = detectIntent(userMessage);
  const loc = toLocale(locale);

  if (options.lockedMessage && intent !== "quiz") {
    return {
      profile,
      message: { id: `rafi-${Date.now()}`, role: "rafi", type: "locked", content: options.lockedMessage, timestamp: new Date() },
    };
  }

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
    const ask = characterQuestion(loc, missing);
    const intro = translate(loc, "cnt.agent.intro");
    return { id, role: "rafi", type: "ask", content: intro, data: ask, timestamp: new Date() };
  };

  // 1. Interactive UI widgets
  if (intent === "ask") {
    const message = askIfNeeded(true)!;
    return { message, profile: nextProfile };
  }

  if (intent === "quiz") {
    const quiz = generateQuizFor(stream, loc);
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "quiz", content: translate(loc, "cnt.agent.quizLabel"), data: quiz, timestamp: new Date() },
    };
  }

  if (intent === "challenge") {
    const challenge = pick(CHALLENGES[loc]);
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "challenge", content: translate(loc, "cnt.agent.challengeLabel"), data: challenge, timestamp: new Date() },
    };
  }

  if (intent === "analyze") {
    const pending = askIfNeeded();
    if (pending) return { message: pending, profile: nextProfile };
    const analysis = analyzeProfile({ ...nextProfile, bacStream: stream as StudentProfile["bacStream"] }, loc);
    return {
      profile: nextProfile,
      message: { id, role: "rafi", type: "analysis", content: translate(loc, "cnt.agent.analyzeLabel"), data: analysis, timestamp: new Date() },
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
    const fields = recommendedFieldIds({ ...nextProfile, bacStream: stream as StudentProfile["bacStream"] });
    return {
      profile: nextProfile,
      message: {
        id, role: "rafi", type: "field-list", content: translate(loc, "cnt.agent.fieldsLabel"),
        data: {
          fields: fields.map((f) => ({
            name: fieldName(f.id, loc),
            description: translate(loc, "cnt.agent.matchDescription", { match: f.match }),
            schools: FIELD_SCHOOLS[f.id] ?? [],
            match: f.match,
          })),
        },
        timestamp: new Date(),
      },
    };
  }

  const pool = GENERAL_RESPONSES[loc];
  const responsePool = intent === "greeting" ? pool.greeting : pool.general;

  return {
    profile: nextProfile,
    message: { id, role: "rafi", type: "text", content: pick(responsePool), timestamp: new Date() },
  };
}
