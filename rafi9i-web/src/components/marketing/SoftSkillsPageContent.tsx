"use client";

import {
  Brain,
  Clock,
  Handshake,
  Lightbulb,
  MessagesSquare,
  Mic,
  ShieldCheck,
  Users,
} from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import { PrimaryButton } from "@/components/shared/Buttons";
import { DISCLAIMER_SHORT } from "@/lib/constants";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";

export default function SoftSkillsPageContent() {
  const { locale, dir } = useI18n();

  const isAr = locale === "ar";
  const isAry = locale === "ary";
  const isEn = locale === "en";

  const breadcrumbHome = isAr ? "الرئيسية" : isAry ? "الرئيسية" : isEn ? "Home" : "Accueil";
  const breadcrumbSoftSkills = isAr ? "المهارات الشخصية" : isAry ? "المهارات اللينة" : isEn ? "Soft Skills" : "Soft skills";

  const eyebrow = isAr ? "المهارات الشخصية والمنهجية" : isAry ? "المهارات اللينة" : isEn ? "Soft Skills" : "Soft skills";
  const title = isAr
    ? "المهارات التي تصنع الفارق الحقيقي، بدءاً من اليوم."
    : isAry
      ? "المهارات لي كادير الفرق الكبير، من دابا."
      : isEn
        ? "The skills that make all the difference, starting today."
        : "Les compétences qui font la différence, dès aujourd'hui.";

  const description = isAr
    ? "المهارات الشخصية (Soft Skills) هي الكفاءات الإنسانية والمنهجية: التواصل، التنظيم، العمل الجماعي، والمرونة. لها نفس وزن النقط الدراسية في المباريات والمسار المهني، والأجمل أنها قابلة للتدريب والتطوير."
    : isAry
      ? "المهارات اللينة هي القدرات الإنسانية والمنهجية: كيفاش كتهضر، كتنظم وقتك، كتخدم مع الناس، وكتصبر فالضغوطات. راها مهمة بحال النقط تماماً فالكونكورات والخدمة، وممكن طورها بالتدريب."
      : isEn
        ? "Soft skills are human and methodical competencies: communicating, organizing, collaborating, and adapting. They matter as much as test scores in Moroccan grande école oral exams and future careers. And best of all: they can be developed."
        : "Les soft skills, ce sont les compétences humaines et méthodologiques : communiquer, s'organiser, coopérer, rebondir. Elles comptent autant que les notes — dans les études, les concours et la vie professionnelle. La bonne nouvelle ? Elles se travaillent.";

  const skills = [
    {
      icon: MessagesSquare,
      name: isAr ? "التواصل الفعال" : isAry ? "التواصل والهضرة" : isEn ? "Communication" : "Communication",
      text: isAr
        ? "التعبير بوضوح كتابياً وشفوياً، والإنصات الحقيقي للآخر — أساس كل المهارات الأخرى."
        : isAry
          ? "توصل فكرتك بوضوح فالكتابة والشفوي، وتسمع للناس مزيان — الساس ديال ڭاع المهارات."
          : isEn
            ? "Expressing ideas clearly in writing and speaking, and truly listening — the foundation of all skills."
            : "Exprimer une idée clairement, à l'écrit comme à l'oral, et écouter vraiment l'autre — la base de toutes les autres compétences.",
    },
    {
      icon: Users,
      name: isAr ? "العمل الجماعي" : isAry ? "الخدمة ففرقة" : isEn ? "Teamwork" : "Travail en équipe",
      text: isAr
        ? "التعاون، وتوزيع الأدوار، وتحقيق أهداف المجموعة حتى مع اختلاف وجهات النظر."
        : isAry
          ? "تتعاون، تقسم الخدمة، وتزيد بالفرقة للقدام واخا تكون الآراء مختلفة."
          : isEn
            ? "Cooperating, distributing roles, and driving a group forward, even when opinions differ."
            : "Coopérer, répartir les rôles et faire avancer un groupe, y compris quand les avis divergent.",
    },
    {
      icon: Clock,
      name: isAr ? "إدارة الوقت" : isAry ? "تنظيم الوقت" : isEn ? "Time Management" : "Gestion du temps",
      text: isAr
        ? "تحديد الأولويات، والتخطيط الواقعي، والالتزام بالمواعيد دون إجهاد نفسي — المنقذ في سنوات الامتحانات."
        : isAry
          ? "ترتب الأولويات وتخطط لوقتك بلا ما تعيا — هادي هي المهارة لي كاتعتق أيام الوطني والامتحانات."
          : isEn
            ? "Prioritizing, planning, and honoring commitments without burnout — the key to exam success."
            : "Prioriser, planifier et tenir ses engagements sans s'épuiser — la compétence qui sauve toutes les années d'examen.",
    },
    {
      icon: Mic,
      name: isAr ? "القيادة والمبادرة" : isAry ? "القيادة والمبادرة" : isEn ? "Leadership" : "Leadership",
      text: isAr
        ? "أخذ زمام المبادرة، وتحفيز الآخرين، وتحمل مسؤولية القرارات — على مقاسك بدءاً من القسم."
        : isAry
          ? "تكون نتا مول المبادرة، تحمس صحابك، وتحمل المسؤولية دالقرارات ابتداءً من القسم."
          : isEn
            ? "Taking initiatives, motivating others, and standing by decisions — starting right from the classroom."
            : "Prendre des initiatives, embarquer les autres dans un projet et assumer les décisions — à sa mesure, dès la classe.",
    },
    {
      icon: Lightbulb,
      name: isAr ? "حل المشكلات" : isAry ? "حل المشاكل" : isEn ? "Problem Solving" : "Résolution de problèmes",
      text: isAr
        ? "تفكيك المسألة، وتجربة الفرضيات، وتعديل الحل — تماماً ما تتطلبه المباريات والامتحانات."
        : isAry
          ? "تقسم المشكل لطراف صغار، تجرب وتعدل — تماماً داكشي لي كايطلبوه الكونكورات."
          : isEn
            ? "Breaking down complex issues, testing hypotheses, and iterating — exactly what exams demand."
            : "Découper un problème, tester des pistes et ajuster — exactement ce que demandent les études et les concours.",
    },
    {
      icon: Brain,
      name: isAr ? "التفكير النقدي" : isAry ? "التفكير النقدي" : isEn ? "Critical Thinking" : "Esprit critique",
      text: isAr
        ? "التمييز بين الحقيقة والرأي، والتحقق من المصادر، وبناء رأي مستقل أمام سيل المعلومات."
        : isAry
          ? "تفرق بين الحقيقة والراي، تأكد من المعلومة، وتبني رايك الشخصي بلا ما تبع لي جا."
          : isEn
            ? "Distinguishing facts from opinions, verifying sources, and forming your own educated viewpoint."
            : "Distinguer un fait d'une opinion, vérifier une source et se forger sa propre avis face à la masse d'informations.",
    },
    {
      icon: Handshake,
      name: isAr ? "المرونة والتأقلم" : isAry ? "التأقلم مع التغيير" : isEn ? "Adaptability" : "Adaptabilité",
      text: isAr
        ? "تقبل تغير البرامج أو الأهداف، والانطلاق مجدداً دون أن تفقد اتجاهك الأساسي."
        : isAry
          ? "تقبل تبدال البرامج ولا الطرق، وترجع بقوة بلا ما تلف على هدفك."
          : isEn
            ? "Embracing changes in schedules, methods, or goals, and bouncing back without losing course."
            : "Accepter le changement de programme, de méthode ou d'objectif, et rebondir sans perdre son cap.",
    },
    {
      icon: ShieldCheck,
      name: isAr ? "الثقة بالنفس" : isAry ? "الثقة فالمعرفة والنفس" : isEn ? "Self-Confidence" : "Confiance en soi",
      text: isAr
        ? "الجرأة على المشاركة، والتعلم من الأخطاء — حلقة إيجابية تُبنى بانتصارات يومية صغيرة."
        : isAry
          ? "تزعم وتهضر، وماتخافش من الغلط حيت هو لي كيعلم — ثقة كتبنى بانتصارات صغيرة كل نهار."
          : isEn
            ? "Taking risks, speaking up, and learning from mistakes — a virtuous cycle built through small daily wins."
            : "Se lancer, oser participer et apprendre de ses erreurs — un cercle vertueux qui se construit par petites victoires.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: isAr ? "حدد أولوياتك" : isAry ? "عرف الأولويات ديالك" : isEn ? "Identify your priorities" : "Identifie tes priorités",
      text: isAr
        ? "يكتشف التقييم المهارات التي يجب التركيز عليها أولاً وفقاً لملفك وطموحاتك."
        : isAry
          ? "التقييم كيعرف المهارات لي خاصك تخدم عليهم الأول على حساب البروفايل والأهداف ديالك."
          : isEn
            ? "The assessment spots the skills to work on first, matched to your profile and goals."
            : "L'évaluation repère les compétences à travailler en premier, selon ton profil et tes objectifs.",
    },
    {
      step: "2",
      title: isAr ? "انتقل للتطبيق" : isAry ? "دوز للفعل" : isEn ? "Take concrete action" : "Passe à l'action",
      text: isAr
        ? "تتحول كل أولوية إلى تمارين وتحديات قصيرة قابلة للتطبيق خلال أسبوعك الدراسي."
        : isAry
          ? "كل أولوية كاتولي تمارين قصيرة وساهلة تطبقها فوسط السيمانة ديال القراية."
          : isEn
            ? "Every priority translates into short, actionable micro-exercises during your school week."
            : "Chaque priorité se traduit en actions concrètes et courtes, réalisables pendant la semaine scolaire.",
    },
    {
      step: "3",
      title: isAr ? "استفد من الموارد" : isAry ? "استافد من الموارد" : isEn ? "Use curated resources" : "Appuie-toi sur des ressources",
      text: isAr
        ? "دروس، وبودكاست، وكتب إلكترونية موجهة لكل مهارة — بتركيز وبدون إغراق بالمعلومات."
        : isAry
          ? "دروس، بودكاست، وكتيبات ملخصة لكل مهارة — بلا ما تدوخ بكترة المعلومات."
          : isEn
            ? "Recommended courses, podcasts, and summaries for each skill — concise and curated."
            : "Cours, podcasts et e-books recommandés pour chaque compétence — sans noyer l'information.",
    },
    {
      step: "4",
      title: isAr ? "تابع تقدمك" : isAry ? "تبع التطور ديالك" : isEn ? "Track your growth" : "Suis ta progression",
      text: isAr
        ? "سجل إنجازاتك واطلع على سجلك الشخصي: ترى مجهودك يتطور يوماً بعد يوم."
        : isAry
          ? "كوشي داكشي لي ساليتي، ورافي كايسجل ليك التقدم: كتشوف المجهود ديالك كيكبر وكيحمسك."
          : isEn
            ? "Check off completed milestones and watch your progress become visible and motivating."
            : "Tu coches ce qui est fait, Rafi9i garde l'historique : les efforts deviennent visibles et motivants.",
    },
  ];

  return (
    <PageContainer className="pt-8" dir={dir}>
      <Breadcrumbs
        items={[
          { name: breadcrumbHome, path: "/" },
          { name: breadcrumbSoftSkills, path: "/soft-skills" },
        ]}
      />

      <div className="max-w-3xl">
        <SectionHeading
          as="h1"
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>

      {/* Skills grid */}
      <section aria-labelledby="competences-titre" className="mt-14">
        <SectionHeading
          title={
            isAr
              ? "المهارات الثماني التي يساعدك رافي على تطويرها"
              : isAry
                ? "ثمانية دالمهارات لي رافي كايعاونك طورهم"
                : isEn
                  ? "The eight skills Rafi helps you build"
                  : "Les huit compétences que Rafi9i t'aide à développer"
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <article
              key={skill.name}
              className="rafi-card rafi-card-hover p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group"
            >
              <span className="rafi-icon-chip group-hover:scale-110 transition-transform" aria-hidden>
                <skill.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {skill.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {skill.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How Rafi helps */}
      <section aria-labelledby="methode-titre" className="mt-16">
        <SectionHeading
          eyebrow={isAr ? "منهجية التعلم" : isAry ? "طريقة التعلم" : isEn ? "Learning Mechanics" : "Mécanique d'Apprentissage"}
          title={isAr ? "كيف يساعدك رافي على التطور" : isAry ? "كيفاش رافي كيعاونك تطور" : isEn ? "How Rafi guides your growth" : "Comment Rafi t'aide à progresser"}
          description={
            isAr
              ? "بروتوكول تدريب محدد يركز على متطلبات المباريات والمقابلات الشفوية للمدارس العليا."
              : isAry
                ? "بروتوكول موجه للمباريات والشفوي ديال المدارس العليا بالمغرب."
                : isEn
                  ? "A targeted training framework calibrated for Moroccan grande école entrance oral exams."
                  : "Un protocole d'entraînement ciblé pour les concours et entretiens de sélection."
          }
        />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.title}
              className="rafi-card flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 font-mono text-sm font-bold text-white shadow-xs"
                aria-hidden
              >
                {step.step}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {isAr
            ? "رافي9ي أداة لتعزيز المنهجية: الأولويات المقترحة هي محاور عمل ملموسة لمساعدتك على التفوق في المقابلات الشفوية."
            : isAry
              ? "رافي أداة باش تقوي المنهجية ديالك: الأولويات لي كيقترح رافي هي محاور واضحة باش تنجح فالشفوي وتندمج فالقراية مزيان."
              : isEn
                ? "Rafi9i is a methodological booster: recommended priorities are concrete focus points to boost your impact in oral interviews."
                : "Rafi9i est un outil de renforcement méthodologique : les priorités suggérées par Rafi sont des axes de travail concrets pour booster ton impact aux oraux et réussir ton intégration."}
        </p>
      </section>

      {/* CTA */}
      <section className="my-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {isAr
            ? "جاهز لاكتشاف نقاط قوتك مع رافي؟"
            : isAry
              ? "واجد باش تعرف المهارات القوية عندك مع رافي؟"
              : isEn
                ? "Ready to measure your key assets with Rafi?"
                : "Prêt à mesurer tes atouts avec Rafi ?"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
          {isAr
            ? "التقييم الأساسي يحدد مجاناً أولويتك الأولى في المهارات الشخصية."
            : isAry
              ? "التقييم الأساسي فابور كيحدد ليك أول مهارة محتاج تخدم عليها."
              : isEn
                ? "The basic assessment maps your first soft-skill priority for free."
                : "L'évaluation de base cartographie gratuitement ta première priorité de soft skills."}
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href={PRODUCT_ROUTES.register} size="lg">
            {isAr ? "اكتشف مهاراتي الأساسية" : isAry ? "اكتشف المهارات ديالي" : isEn ? "Discover My Key Skills" : "Découvrir mes compétences clés"}
          </PrimaryButton>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{DISCLAIMER_SHORT}</p>
      </section>
    </PageContainer>
  );
}
