/**
 * Rafi9i — Public demo content (Developer 1)
 * Static seed used by the public resources page and the landing
 * preview. Everything is demonstration content: no external links, no
 * copyrighted material, always badged "Démo" in the UI.
 *
 * Text exists in the four UI locales. `PUBLIC_RESOURCES` stays the French,
 * SSR-stable list (same ids/order/shape as before); use
 * `getPublicResources(locale)` to render the list in the current language.
 */
import type { PublicResource } from "@/components/shared/ResourceCard";
import type { Locale } from "@/lib/i18n";

type ResourceText = Pick<PublicResource, "title" | "description" | "duration" | "topic">;

/** Locale-independent part of each resource, in display order. */
const RESOURCE_META: Pick<PublicResource, "type" | "access">[] = [
  { type: "cours", access: "free" },
  { type: "cours", access: "premium" },
  { type: "podcast", access: "free" },
  { type: "podcast", access: "free" },
  { type: "ebook", access: "premium" },
  { type: "ebook", access: "free" },
  { type: "podcast", access: "premium" },
  { type: "cours", access: "premium" },
];

const RESOURCE_TEXT: Record<Locale, ResourceText[]> = {
  fr: [
    {
      title: "Apprendre à apprendre : la méthode active",
      description:
        "Comprendre pourquoi relire ne suffit pas, et s'entraîner aux techniques qui font vraiment retenir : rappel actif, espacement, exemples concrets.",
      duration: "45 min",
      topic: "Soft skills · Méthodologie",
    },
    {
      title: "Parler en public avec assurance",
      description:
        "Structurer un exposé, gérer le trac et captiver son auditoire — un entraînement progressif pensé pour les présentations de classe.",
      duration: "1 h 10",
      topic: "Soft skills · Communication",
    },
    {
      title: "Choisir sa filière après le Bac sciences",
      description:
        "Panorama des grandes familles d'études scientifiques au Maroc : classes préparatoires, licences, écoles d'ingénieurs — et comment trancher.",
      duration: "32 min",
      topic: "Orientation · Sciences",
    },
    {
      title: "Le rituel du dimanche : planifier sa semaine",
      description:
        "Un épisode pratique pour installer une routine de planification simple, durable et adaptée au rythme d'un étudiant.",
      duration: "25 min",
      topic: "Soft skills · Gestion du temps",
    },
    {
      title: "Guide pratique après le Bac : filières et alternatives",
      description:
        "Comment comparer des filières, lire une offre de formation et préparer un dossier solide — avec des checklists à cocher étape par étape.",
      duration: "60 pages",
      topic: "Orientation · Post-Bac",
    },
    {
      title: "Mini-guide : construire sa première roadmap d'orientation",
      description:
        "Transformer un objectif flou (« réussir ») en plan daté et réaliste, avec des jalons mesurables et des points d'étape mensuels.",
      duration: "20 pages",
      topic: "Orientation · Méthode",
    },
    {
      title: "Travail en équipe : réussir un projet de groupe",
      description:
        "Répartir les rôles, gérer les désaccords et livrer à temps — les codes du travail d'équipe expliqués avec des exemples scolaires.",
      duration: "28 min",
      topic: "Soft skills · Collaboration",
    },
    {
      title: "Organiser ses révisions avant les examens",
      description:
        "Prioriser les matières, découper les sessions et éviter le bachotage : une méthode de préparation saine et répétable.",
      duration: "50 min",
      topic: "Soft skills · Organisation",
    },
  ],
  en: [
    {
      title: "Learn how to learn: the active method",
      description:
        "Find out why rereading is not enough and practice techniques that improve retention: active recall, spaced learning and concrete examples.",
      duration: "45 min",
      topic: "Soft skills · Study methods",
    },
    {
      title: "Speak confidently in public",
      description:
        "Structure a presentation, manage nerves and engage your audience with progressive practice designed for classroom presentations.",
      duration: "1 h 10 min",
      topic: "Soft skills · Communication",
    },
    {
      title: "Choosing a path after a science Bac",
      description:
        "An overview of scientific study paths in Morocco: preparatory classes, degrees and engineering schools — and how to choose.",
      duration: "32 min",
      topic: "Orientation · Sciences",
    },
    {
      title: "The Sunday ritual: plan your week",
      description:
        "A practical episode for building a simple, sustainable planning routine that fits a student's schedule.",
      duration: "25 min",
      topic: "Soft skills · Time management",
    },
    {
      title: "A practical post-Bac guide: fields and alternatives",
      description:
        "How to compare fields, read a program description and prepare a strong application, with step-by-step checklists.",
      duration: "60 pages",
      topic: "Orientation · Post-Bac",
    },
    {
      title: "Mini-guide: build your first orientation roadmap",
      description:
        "Turn a vague goal (“succeed”) into a realistic, dated plan with measurable milestones and monthly check-ins.",
      duration: "20 pages",
      topic: "Orientation · Planning",
    },
    {
      title: "Teamwork: succeed at a group project",
      description:
        "Share roles, handle disagreements and deliver on time — teamwork skills explained with school-based examples.",
      duration: "28 min",
      topic: "Soft skills · Collaboration",
    },
    {
      title: "Organize your revision before exams",
      description:
        "Prioritize subjects, break up study sessions and avoid cramming with a healthy, repeatable preparation method.",
      duration: "50 min",
      topic: "Soft skills · Organization",
    },
  ],
  ar: [
    {
      title: "تعلّم كيف تتعلّم: الطريقة النشطة",
      description:
        "اكتشف لماذا لا تكفي إعادة القراءة، وتدرّب على أساليب تثبيت المعلومات: الاسترجاع النشط، والتكرار المتباعد، والأمثلة العملية.",
      duration: "45 دقيقة",
      topic: "المهارات الناعمة · منهجية الدراسة",
    },
    {
      title: "تحدث أمام الجمهور بثقة",
      description:
        "نظّم عرضك، وتحكّم في التوتر، واجذب انتباه جمهورك عبر تدريب تدريجي مخصص للعروض الصفية.",
      duration: "ساعة و10 دقائق",
      topic: "المهارات الناعمة · التواصل",
    },
    {
      title: "اختيار مسار بعد باكالوريا العلوم",
      description:
        "نظرة على مسارات الدراسات العلمية في المغرب: الأقسام التحضيرية والإجازات ومدارس المهندسين، وكيفية الاختيار.",
      duration: "32 دقيقة",
      topic: "التوجيه · العلوم",
    },
    {
      title: "عادة يوم الأحد: خطط لأسبوعك",
      description: "حلقة عملية لبناء روتين تخطيط بسيط ومستدام يناسب إيقاع حياة الطالب.",
      duration: "25 دقيقة",
      topic: "المهارات الناعمة · إدارة الوقت",
    },
    {
      title: "دليل عملي لما بعد الباك: المسارات والبدائل",
      description:
        "كيفية مقارنة المسارات وقراءة عروض التكوين وإعداد ملف قوي، مع قوائم تحقق خطوة بخطوة.",
      duration: "60 صفحة",
      topic: "التوجيه · ما بعد الباك",
    },
    {
      title: "دليل مصغّر: أنشئ أول مسار للتوجيه",
      description:
        "حوّل هدفاً غامضاً مثل «النجاح» إلى خطة واقعية ومؤرخة، مع مراحل قابلة للقياس ومراجعات شهرية.",
      duration: "20 صفحة",
      topic: "التوجيه · التخطيط",
    },
    {
      title: "العمل الجماعي: أنجح مشروعاً جماعياً",
      description:
        "وزّع الأدوار، وعالج الخلافات، وسلّم العمل في الوقت — مهارات العمل الجماعي بأمثلة مدرسية.",
      duration: "28 دقيقة",
      topic: "المهارات الناعمة · التعاون",
    },
    {
      title: "نظّم مراجعتك قبل الامتحانات",
      description:
        "رتّب المواد حسب الأولوية، وقسّم جلسات المراجعة، وتجنب الحفظ المكثف بأسلوب تحضير صحي وقابل للاستمرار.",
      duration: "50 دقيقة",
      topic: "المهارات الناعمة · التنظيم",
    },
  ],
  ary: [
    {
      title: "تعلم كيفاش تتعلم: الطريقة النشيطة",
      description:
        "فهم علاش القراية عاوتاني ما كافياش، وتمرن على التقنيات اللي كتخليك تحفظ بصح: تسترجع المعلومة، تفرق المراجعة، وتخدم بأمثلة.",
      duration: "45 دقيقة",
      topic: "السوفت سكيلز · طريقة القراية",
    },
    {
      title: "هضر قدام الناس بثقة",
      description:
        "نظم العرض ديالك، تحكم فالتوتر وجبد الانتباه ديال اللي كيسمعوك — تدريب خطوة بخطوة موجد للعروض فالقسم.",
      duration: "ساعة و10 دقايق",
      topic: "السوفت سكيلز · التواصل",
    },
    {
      title: "ختار الشعبة ديالك من بعد باك علوم",
      description:
        "نظرة على الطرق ديال القراية العلمية فالمغرب: الأقسام التحضيرية، الإجازات، مدارس المهندسين — وكيفاش تختار.",
      duration: "32 دقيقة",
      topic: "التوجيه · العلوم",
    },
    {
      title: "عادة نهار الحد: نظم السيمانة ديالك",
      description: "حلقة عملية باش تدير روتين ديال التخطيط ساهل، كيدوم ومناسب للإيقاع ديال الطالب.",
      duration: "25 دقيقة",
      topic: "السوفت سكيلز · تنظيم الوقت",
    },
    {
      title: "دليل عملي من بعد الباك: الشعب والبدائل",
      description:
        "كيفاش تقارن بين الشعب، تقرا عرض التكوين وتوجد ملف قوي — مع ليستات ديال الخطوات تشيكي عليهم وحدة بوحدة.",
      duration: "60 صفحة",
      topic: "التوجيه · من بعد الباك",
    },
    {
      title: "دليل صغير: دير أول خطة ديال التوجيه ديالك",
      description:
        "بدل هدف مضبب بحال «ننجح» بخطة واقعية بالتواريخ، فيها مراحل كتقاس ووقفات كل شهر.",
      duration: "20 صفحة",
      topic: "التوجيه · التخطيط",
    },
    {
      title: "الخدمة الجماعية: نجح مشروع مع الجماعة",
      description:
        "قسم الأدوار، حل الخلافات وسلم فالوقت — القواعد ديال الخدمة الجماعية بأمثلة من القراية.",
      duration: "28 دقيقة",
      topic: "السوفت سكيلز · التعاون",
    },
    {
      title: "نظم المراجعة ديالك قبل الامتحانات",
      description:
        "رتب المواد على حساب الأولوية، قسم الجلسات وما تحفظش كلشي فالليلة الأخيرة: طريقة تحضير صحية وتقدر تعاودها.",
      duration: "50 دقيقة",
      topic: "السوفت سكيلز · التنظيم",
    },
  ],
};

/** Public demo resources in the given UI locale (same order and shape in every locale). */
export function getPublicResources(locale: Locale = "fr"): PublicResource[] {
  const texts = RESOURCE_TEXT[locale] ?? RESOURCE_TEXT.fr;
  return RESOURCE_META.map((meta, i) => ({ ...meta, ...texts[i] }));
}

/** French list, kept for SSR-stable rendering and backwards compatibility. */
export const PUBLIC_RESOURCES: PublicResource[] = getPublicResources("fr");
