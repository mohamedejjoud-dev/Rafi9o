"use client";

import { BrainCircuit, ChartPie, GraduationCap, HeartHandshake, Lightbulb, Scale } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import FeatureCard from "@/components/shared/FeatureCard";
import { PrimaryButton } from "@/components/shared/Buttons";
import StatusBadge from "@/components/shared/StatusBadge";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";

export default function OrientationPageContent() {
  const { t, locale, dir } = useI18n();

  const isAr = locale === "ar";
  const isEn = locale === "en";

  const breadcrumbHome = isAr ? "الرئيسية" : isEn ? "Home" : "Accueil";
  const breadcrumbOrientation = isAr ? "التوجيه" : isEn ? "Orientation" : "Orientation";

  const eyebrow = isAr ? "التوجيه الدراسي" : isEn ? "Orientation" : "Orientation";
  const title = isAr
    ? "التوجيه يبدأ أولاً بمعرفة الذات."
    : isEn
        ? "Orientation starts with knowing yourself."
        : "L'orientation, c'est d'abord se connaître.";

  const description = isAr
    ? "يقوم التوجيه الأكاديمي على اختيار مسار دراسي يوفق بين ثلاث ركائز: من أنت، ما يثير اهتمامك، وما يقدمه عالم الدراسات والمهن. رافي ينظم هذا التوفيق خطوة بخطوة."
    : isEn
        ? "Academic orientation consists of choosing a study path by combining who you are, what interests you, and what higher education and careers offer in Morocco. Rafi structures this match step by step."
        : "L'orientation académique consiste à choisir une direction d'études en croisant trois choses : qui tu es, ce qui t'intéresse, et ce que le monde des études et des métiers peut t'offrir. Rafi9i structure ce croisement, étape par étape.";

  const studiedItems = [
    {
      icon: BrainCircuit,
      title: isAr
        ? "نقاط قوتك الأكاديمية"
        : isEn
            ? "Your academic strengths"
            : "Tes forces académiques",
      text: isAr
        ? "المواد التي تبرع فيها، طريقتك المفضلة في التعلم، وأنماط التفكير التي تتقنها."
        : isEn
            ? "The subjects you excel at, how you learn best, and the reasoning styles that suit you."
            : "Les matières où tu es à l'aise, la manière dont tu apprends et les types de raisonnement qui te réussissent.",
    },
    {
      icon: Lightbulb,
      title: isAr
        ? "مجالات اهتمامك"
        : isEn
            ? "Your interests"
            : "Tes centres d'intérêt",
      text: isAr
        ? "ما يشعل حماسك: العلوم، التجارة، الابتكار، مساعدة الآخرين، التكنولوجيا... الشغف هو محرك الجهد."
        : isEn
            ? "What excites you: science, business, creative fields, helping others, tech... Genuine interest sustains effort."
            : "Ce qui t'énerve d'envie : sciences, commerce, création, aide aux autres, technologie… L'intérêt soutient l'effort.",
    },
    {
      icon: Scale,
      title: isAr
        ? "تفضيلاتك المهنية"
        : isEn
            ? "Your work preferences"
            : "Tes préférences",
      text: isAr
        ? "العمل الفردي أو الجماعي، النظري أو التطبيقي، الإطار المنظم أو الاستقلالية — مؤشرات حاسمة لحياتك الجامعية."
        : isEn
            ? "Solo vs team work, theory vs practice, structured vs autonomous — decisive indicators for your student life."
            : "Travailler seul ou en équipe, théorie ou pratique, cadre structuré ou autonomie — des indices décisifs pour ton quotidien d'étudiant.",
    },
    {
      icon: HeartHandshake,
      title: isAr
        ? "رؤيتك المستقبلية"
        : isEn
            ? "Your future projection"
            : "Ta manière de te projeter",
      text: isAr
        ? "بيئات العمل والمهام التي تحفزك، لربط دراستك الحالية بمسار مهني واقعي ومستدام."
        : isEn
            ? "Work environments and project types that motivate you, linking your studies to a clear career direction."
            : "Les environnements de travail et les types de missions qui te motivent, pour relier tes études à une direction professionnelle.",
    },
  ];

  const tableRows = isAr
    ? [
        ["استبيان التقييم", "12 سؤالاً قصيراً", "10 أسئلة معمقة إضافية"],
        ["الملف الشخصي", "ملخص أولي", "تحليل دقيق ومفصل"],
        ["الشعب والمدارس المقترحة", "ثلاثة مجالات ممكنة", "شروحات مفصلة لكل شعبة ومؤسسة"],
        ["المهارات الشخصية (Soft Skills)", "أولوية أولى للتدريب", "خطة تدريب وتطوير مخصصة"],
        ["خريطة الطريق (Roadmap)", "—", "خطة عمل كاملة على 4 مراحل للمباريات"],
        ["طريقة الدفع", "مجاني", "19 درهم بتحويل عبر واتساب، التفعيل بعد التحقق"],
      ]
    : isEn
        ? [
            ["Assessment", "12 short questions", "10 additional in-depth questions"],
            ["Profile", "Initial summary", "Detailed, comprehensive analysis"],
            ["Suggested fields", "Three top domains", "In-depth insights per field & school"],
            ["Soft skills", "First priority skill", "Personalized improvement plan"],
            ["Roadmap", "—", "Full 4-step Moroccan exam roadmap"],
            ["Payment", "Free", "19 DH by transfer via WhatsApp, activated after verification"],
          ]
        : [
            ["Questionnaire", "12 questions courtes", "10 questions approfondies supplémentaires"],
            ["Profil", "Résumé initial", "Analyse détaillée"],
            ["Domaines suggérés", "Trois domaines possibles", "Explications approfondies par domaine"],
            ["Soft skills", "Première piste", "Plan personnalisé d'amélioration"],
            ["Roadmap", "—", "Feuille de route complète en 4 étapes"],
            ["Paiement", "Gratuit", "19 DH par virement via WhatsApp, activé après vérification"],
          ];

  return (
    <PageContainer className="pt-8" dir={dir}>
      <Breadcrumbs
        items={[
          { name: breadcrumbHome, path: "/" },
          { name: breadcrumbOrientation, path: "/orientation" },
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

      {/* What Rafi9i studies */}
      <section aria-labelledby="etudie-titre" className="mt-14">
        <SectionHeading
          title={
            isAr
              ? "ما يدرسه رافي في ملفك"
              : isEn
                  ? "What Rafi analyzes in your profile"
                  : "Ce que Rafi9i étudie chez toi"
          }
          description={
            isAr
              ? "التقييم الأساسي (12 سؤالاً، حوالي 10 دقائق) والتقييم المتقدم (10 أسئلة) يستكشفان أربعة أبعاد أساسية."
              : isEn
                  ? "The basic assessment (12 questions, ~10 mins) and advanced evaluation (10 questions) explore four key dimensions."
                  : "L'évaluation de base (12 questions, ~10 minutes) et l'évaluation avancée (10 questions) explorent quatre dimensions de ton profil."
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {studiedItems.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              {item.text}
            </FeatureCard>
          ))}
        </div>
      </section>

      {/* Basic vs Premium Preview */}
      <section aria-labelledby="comparaison-titre" className="mt-16">
        <SectionHeading
          title={
            isAr
              ? "التقييم الأساسي ومعاينة بريميوم"
              : isEn
                  ? "Basic Assessment & Premium Preview"
                  : "Évaluation de base et Premium Preview"
          }
          description={
            isAr
              ? "مستويان من التحليل لهدف واحد: مساعدتك على اتخاذ قرار دراسي واضح ومدروس."
              : isEn
                  ? "Two depths of insight for a single goal: helping you decide with total clarity."
                  : "Deux niveaux de profondeur pour un même objectif : t'aider à décider avec clarté."
          }
        />
        <div className="rafi-card mt-8 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-start text-sm">
              <caption className="sr-only">{t("pub.orientation.tableCaption")}</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th scope="col" className="px-5 py-3.5 text-start">
                    {isAr ? "ما ستحصل عليه" : isEn ? "What you get" : "Ce que tu obtiens"}
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-start">
                    {isAr ? "الأساسي — مجاني" : isEn ? "Basic — Free" : "Base — gratuite"}
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-start text-orange-600 dark:text-orange-400">
                    {isAr ? "بريميوم" : "Premium"} — {t("premium.price")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {tableRows.map(([aspect, free, premium]) => (
                  <tr key={aspect} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <th scope="row" className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 text-start">{aspect}</th>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 text-start">{free}</td>
                    <td className="px-5 py-3.5 text-orange-600 dark:text-orange-400 font-semibold text-start">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <StatusBadge variant="demo" />{" "}
          {isAr
            ? "المثال أدناه يوضح شكل النتيجة التقديرية ببيانات توضيحية."
            : isEn
                ? "The example below shows a simulated outcome format."
                : "L'exemple ci-dessous montre la forme d'un résultat, avec des données fictives."}
        </p>
      </section>

      {/* Example result */}
      <section aria-labelledby="exemple-titre" className="mt-12">
        <div className="rafi-card mx-auto max-w-xl p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isAr ? "نموذج لنتيجة التوافق" : isEn ? "Sample Affinity Result" : "Exemple de résultat"}
            </h3>
            <StatusBadge variant="demo" />
          </div>
          <div className="mt-4 space-y-3.5">
            {[
              {
                field: isAr ? "الهندسة والمعلوميات (ENSA/EMI/ENSIAS)" : isEn ? "Engineering & Computer Science" : "Ingénierie & informatique",
                score: 86,
              },
              {
                field: isAr ? "العلوم والطب (FMP/FMD/IAV)" : isEn ? "Health Sciences & Medicine" : "Sciences expérimentales",
                score: 74,
              },
              {
                field: isAr ? "التجارة والتسيير (ENCG/ISCAE)" : isEn ? "Business & Management" : "Commerce & gestion",
                score: 62,
              },
            ].map((match) => (
              <div key={match.field}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{match.field}</span>
                  <span className="font-bold font-mono text-orange-600 dark:text-orange-400">{match.score} %</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden>
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${match.score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {isAr
              ? "بيانات محاكاة. تعني الدرجة العالية وجود توافق منهجي مع ملفك — وليست بأي حال وعداً رسمياً بالقبول."
              : isEn
                  ? "Simulation data. A high compatibility score indicates methodical alignment with your profile — never a guarantee of admission."
                  : "Données de simulation. Un score élevé signifie une affinité méthodologique avec ton profil — jamais une promesse d'admission garantie."}
          </p>
        </div>
      </section>

      {/* How recommendations are generated + disclaimer */}
      <section aria-labelledby="recommandations-titre" className="mt-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rafi-card p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="rafi-icon-chip" aria-hidden>
              <ChartPie className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </span>
            <h2 id="recommandations-titre" className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              {isAr ? "كيف يتم احتساب التوصيات" : isEn ? "How recommendations are calculated" : "Comment les recommandations sont générées"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {isAr
                ? "تُحلل إجاباتك أولاً بحساب خوارزمي دقيق وموضوعي: قواعد صريحة تقارن ملفك بمتطلبات شعب التعليم العالي في المغرب. ثم يتدخل رافي لشرح السياق وتبسيط خطوات التحضير."
                : isEn
                ? "Your answers are analyzed via deterministic scoring: explicit, verifiable rules compare your profile against Moroccan higher education tracks. Rafi then contextualizes the results with practical advice."
                : "Tes réponses sont d'abord analysées par un calcul déterministe : des règles explicites comparent ton profil aux filières d'études supérieures au Maroc. Rafi intervient ensuite pour contextualiser les conseils et t'expliquer les étapes."}
            </p>
          </div>
          <div className="rafi-card p-7 border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20">
            <span className="rafi-icon-chip !bg-white dark:!bg-slate-900" aria-hidden>
              <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-orange-950 dark:text-orange-200">
              {isAr ? "ملاحظة هامة قبل البدء" : isEn ? "Important — read before starting" : "Important — à lire avant de commencer"}
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <li>
                • {isAr
                  ? "التوصيات إرشادية وتوجيهية : لا تضمن القبول التلقائي ولا النجاح في المباريات."
                  : isEn
                      ? "Recommendations are indicative: they guarantee neither admission nor contest success."
                      : "Les recommandations sont indicatives : elles ne garantissent ni admission, ni réussite aux concours."}
              </li>
              <li>
                • {isAr
                  ? "النتائج لا تمثل تشخيصاً نفسياً أو رأياً رسمياً من الدولة."
                  : isEn
                      ? "Scores constitute neither psychological diagnoses nor official government counsel."
                      : "Les scores ne constituent ni un diagnostic psychologique, ni un avis officiel d'orientation."}
              </li>
              <li>
                • {isAr
                  ? "المعايير مستندة إلى عتبات ومقررات المباريات والأقسام التحضيرية في المغرب."
                  : isEn
                      ? "Data is calibrated against Moroccan CPGE, Tawjihi, and grande école benchmarks."
                      : "Les données sont calibrées sur les référentiels de concours et prépas du Maroc."}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="my-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {isAr
            ? "هل أنت مستعد لاكتشاف مسارك مع رافي؟"
            : isEn
                ? "Ready to reveal your affinity profile with Rafi?"
                : "Prêt à révéler ton profil d'affinité avec Rafi ?"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
          {isAr
            ? "التقييم الأساسي مجاني 100% ويستغرق أقل من 10 دقائق."
            : isEn
                ? "The basic assessment is 100% free and takes less than 10 minutes."
                : "L'évaluation de base est 100% gratuite et te prendra moins de 10 minutes."}
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href={PRODUCT_ROUTES.register} size="lg">
            {isAr ? "ابدأ توجيهي الآن" : isEn ? "Start My Assessment" : "Commencer mon orientation"}
          </PrimaryButton>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t("footer.disclaimer")}</p>
      </section>
    </PageContainer>
  );
}
