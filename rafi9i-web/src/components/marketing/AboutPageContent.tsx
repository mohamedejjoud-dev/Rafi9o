"use client";

import { Bot, Calculator, Rocket } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import RafiFox from "@/components/mascot/RafiFox";
import { useI18n } from "@/lib/i18n";

export default function AboutPageContent() {
  const { locale, dir } = useI18n();

  const isAr = locale === "ar";
  const isAry = locale === "ary";
  const isEn = locale === "en";

  const breadcrumbHome = isAr ? "الرئيسية" : isAry ? "الرئيسية" : isEn ? "Home" : "Accueil";
  const breadcrumbAbout = isAr ? "عن المنصة" : isAry ? "على رفيقي" : isEn ? "About" : "À propos";

  const eyebrow = isAr ? "الرؤية والرسالة" : isAry ? "الرؤية والمهمة" : isEn ? "Vision & Mission" : "Vision & Mission";
  const title = isAr
    ? "انطلق رفيقي من واقع ملموس: في المغرب، يختار العديد من التلاميذ مسارهم صدفة."
    : isAry
      ? "رفيقي جا من فكرة بسيطة: فالمغرب، بزاف دالتلامذ كيعزلو التوجيه ديالهم غير بالصدفة."
      : isEn
        ? "Rafi9i was born from a simple fact: in Morocco, too many students choose their path by default."
        : "Rafi9i est né d'un constat simple : au Maroc, trop d'élèves choisissent leur voie par défaut.";

  const description = isAr
    ? "بسبب غياب التوجيه المبكر وضيق الوقت للاستكشاف، يسلك الكثيرون شعباً لا تعبر عن إمكانياتهم الحقيقية. رفيقي يغير المعادلة: نمنح كل تلميذ وطالب فضاءً ذكياً ومشجعاً لاكتشاف طاقاته وبناء مساره المستقبلي بمرافقة رافي."
    : isAry
      ? "حيت ماكاينش توجيه واضح والوقت ديما مزير، بزاف دالشباب كيتبعو شي طريق غير حيت صحابهم مشاو فيها. رفيقي جا باش يبدل هادشي: يعطي لكل تلميذ وطالب فضاء زوين ومريح باش يكتشف طاقاتو ويرسم طريقو مع رافي."
      : isEn
        ? "Without clear guidance and time to explore, many follow default tracks without knowing if it fits them. Rafi9i changes that: giving every Moroccan high schooler and student a supportive, smart space to reveal their talents and chart their course with Rafi."
        : "Faute de repères clairs et de temps pour explorer, beaucoup suivent la voie suggérée sans savoir si elle leur correspond. Rafi9i change la donne : offrir à chaque lycéen et étudiant un espace bienveillant pour révéler ses talents et bâtir sa trajectoire avec Rafi.";

  const isItems = isAr
    ? [
        "مسار منظم: تشخيص أولي، دليل للمدارس العليا والجامعات بالمغرب، وخطة متابعة دقيقة.",
        "حساب موضوعي وشفاف: معايير واضحة تقارن ملفك بمتطلبات الشعب الأكاديمية.",
        "رفيق توجيه ذكي: رافي، يدعمك بتشجيع ومنهجية واضحة في كل مرحلة.",
        "أداة صريحة وشفافة: شرح دقيق للعتبات والمباريات بدون وعود زائفة أو خيالية.",
      ]
    : isAry
      ? [
          "طريق منظمة: تشخيص أولي، دليل حقيقي للمدارس العليا فالمغرب، ومتابعة واضحة.",
          "تنقيط موضوعي: قواعد دقيقة كتقارن بروفايلك مع المدارس والشعب.",
          "رفيق ذكي ومحمس: رافي، لي غادي يرافقك خطوة بخطوة بالتشجيع والمنهجية.",
          "أداة واضحة ومباشرة: كنشرحو العتبات والكونكورات بلا وعود كاذبة.",
        ]
      : isEn
        ? [
            "A structured journey: diagnostic assessment, catalog of real Moroccan schools, roadmap & tracking.",
            "Deterministic scoring: clear, objective rules that match your profile to actual requirements.",
            "A friendly AI guide: Rafi, providing personalized guidance and encouragement.",
            "Complete transparency: realistic cutoffs and criteria explained without exaggerated claims.",
          ]
        : [
            "Un parcours structuré : diagnostic initial, catalogue d'écoles réelles au Maroc, roadmap et suivi.",
            "Un scoring déterministe : des règles claires et objectives qui comparent ton profil aux filières.",
            "Un compagnon d'orientation : Rafi, qui t'accompagne avec bienveillance et méthode.",
            "Un outil transparent : les seuils et critères sont expliqués sans promesses irréalistes.",
          ];

  const isNotItems = isAr
    ? [
        "وعد بالقبول التلقائي — مجهودك ومراجعتك هما مفتاح النجاح الأساسي.",
        "اختبار نفسي غامض أو غير علمي.",
        "مجرد لائحة عشوائية غير مصنفة للمؤسسات.",
        "خدمة حكومية رسمية: لا ندعي أي انتماء أو صفة رسمية.",
      ]
    : isAry
      ? [
          "وعد بالقبول المضمون — الخدمة والمراجعة ديالك هي الأساس ديما.",
          "تيست نفسي غامض أو ما عندو معنى.",
          "مجرد ليستة عشوائية ديال المدارس.",
          "خدمة رسمية ديال الدولة: ما كندعيو حتى شي صفة حكومية.",
        ]
      : isEn
        ? [
            "A promise of guaranteed admission — your hard work and revision remain the key.",
            "An opaque or pseudo-scientific psychological test.",
            "A generic, unqualified list of establishments.",
            "An official state entity: no misleading governmental affiliation is claimed.",
          ]
        : [
            "Une promesse d'admission automatique — ton travail et tes révisions restent la clé.",
            "Un test psychologique opaque ou pseudo-scientifique.",
            "Une simple liste non qualifiée d'établissements.",
            "Un service officiel étatique : aucune affiliation trompeuse n'est revendiquée.",
          ];

  return (
    <PageContainer className="pt-8" dir={dir}>
      <Breadcrumbs
        items={[
          { name: breadcrumbHome, path: "/" },
          { name: breadcrumbAbout, path: "/about" },
        ]}
      />

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <SectionHeading
            as="h1"
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </div>
        <div className="rf-float mx-auto" aria-hidden>
          <RafiFox stage="welcome" mood="encouraging" size={200} decorative />
        </div>
      </div>

      {/* What is Rafi9i */}
      <section aria-labelledby="definition-titre" className="mt-14">
        <div className="rafi-card p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 id="definition-titre" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isAr ? "رفيقي في تعريف موجز" : isAry ? "رفيقي فكلمات بساط" : isEn ? "Rafi9i in One Definition" : "Rafi9i, en une définition"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <strong className="text-slate-800 dark:text-slate-100">
              {isAr
                ? "رفيقي منصة ويب للتوجيه الأكاديمي، وتطوير المهارات الشخصية، والتحضير للمباريات، صُممت خصيصاً لتلاميذ وطلاب المغرب."
                : isAry
                  ? "رفيقي منصة ويب للتوجيه الدراسي، وتطوير المهارات اللينة، والتحضير للكونكورات، مصاوبة خصيصاً للتلامذ والطلبة فالمغرب."
                  : isEn
                    ? "Rafi9i is a web platform for academic orientation, soft skills development, and contest preparation designed specifically for Moroccan high schoolers and students."
                    : "Rafi9i est une plateforme web d'orientation académique, de développement des soft skills et de préparation aux concours, conçue spécialement pour les lycéens et étudiants du Maroc."}
            </strong>{" "}
            {isAr
              ? "يجيب التلميذ على تقييم أساسي مجاني (12 سؤالاً دقيقاً)، ويحصل على أول تشخيص لنسب التوافق مع المدارس العليا والجامعات المغربية، ويستكشف خريطة الطريق ويتابع تطوره مع رافي من حسابه الخاص."
              : isAry
                ? "التلميذ كايجاوب على تقييم أساسي فابور (12 سؤال)، كايحصل على أول تشخيص كيبين المدارس المناسبة ليه فالمغرب، وكايكتاشف خريطة الطريق باش يتبع تطورو مع رافي فالحساب ديالو."
                : isEn
                  ? "Students complete a free basic assessment (12 questions), receive an initial affinity diagnostic with Moroccan grandes écoles and universities, explore the roadmap, and track their preparation with Rafi from their space."
                  : "L'élève répond à une évaluation de base gratuite (12 questions ciblées), obtient un premier diagnostic d'affinité avec les grandes écoles et universités marocaines, explore la roadmap et pilote sa progression avec Rafi depuis son espace personnel."}
          </p>
        </div>
      </section>

      {/* Is / is not */}
      <section aria-labelledby="honnete-titre" className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rafi-card p-7 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
          <h2 id="honnete-titre" className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-300">
            <Rocket className="h-5 w-5" aria-hidden />{" "}
            {isAr ? "ما تمثله منصة رفيقي" : isAry ? "شنو كايقدم رفيقي" : isEn ? "What Rafi9i is" : "Ce que Rafi9i est"}
          </h2>
          <ul className="mt-4 space-y-3">
            {isItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rafi-card p-7 border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-300">
            {isAr ? "ما لا تمثله منصة رفيقي" : isAry ? "شنو ماكاينش فرفيقي" : isEn ? "What Rafi9i is not" : "Ce que Rafi9i n'est pas"}
          </h2>
          <ul className="mt-4 space-y-3">
            {isNotItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AI vs scoring */}
      <section aria-labelledby="ia-titre" className="mt-14">
        <SectionHeading
          eyebrow={isAr ? "الصرامة والوضوح" : isAry ? "الوضوح والدقة" : isEn ? "Clarity & Rigor" : "Rigueur & Clarté"}
          title={isAr ? "دور الذكاء الاصطناعي وإطاره الأخلاقي" : isAry ? "الدور ديال الذكاء الاصطناعي والجانب الأخلاقي" : isEn ? "The Role of AI & Ethical Framework" : "Le rôle de l'IA — et son cadre éthique"}
          description={
            isAr
              ? "نستخدم التحليل الذكي لإضاءة اختياراتك وتبسيط المعايير المعقدة، دون أن نقرر أبداً بالنيابة عنك."
              : isAry
                ? "كنستعملو التحليل الذكي باش نوضحو ليك الطرق ونبسطو الحسابات المعقدة، بلا ما نقررو فبلاصتك."
                : isEn
                  ? "We use smart analysis to clarify your options and synthesize complex criteria, never to decide in your place."
                  : "Nous utilisons l'analyse intelligente pour éclairer tes choix et synthétiser des critères complexes, jamais pour décider à ta place."
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <article className="rafi-card p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="rafi-icon-chip" aria-hidden>
              <Calculator className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              {isAr ? "حساب موضوعي ومنهجي أولاً" : isAry ? "حساب موضوعي هو الأول" : isEn ? "Deterministic scoring first" : "Un calcul déterministe d'abord"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {isAr
                ? "يتم احتساب التوافق بين ملفك والشعب المغربية عبر قواعد واضحة وموزونة ومتحقق منها: نفس الإجابات تعطي دائماً نفس النتيجة الموضوعية."
                : isAry
                  ? "التوافق بين بروفايلك والمدارس العليا كيتحسب بقواعد مضبوطة ومجربة: نفس الإجابات كتعطي نفس النتيجة ديما."
                  : isEn
                    ? "Compatibility between your profile and Moroccan fields is calculated via explicit, weighted, and verifiable rules: identical answers yield identical objective scores."
                    : "La compatibilité entre ton profil et les filières marocaines est calculée par des règles explicites, pondérées et vérifiables : mêmes réponses, même score objectif."}
            </p>
          </article>
          <article className="rafi-card p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="rafi-icon-chip" aria-hidden>
              <Bot className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              {isAr ? "رافي للشرح والمرافقة" : isAry ? "رافي باش يشرح وينصحك" : isEn ? "Rafi to explain & counsel" : "Rafi pour expliquer et conseiller"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {isAr
                ? "يشرح لك رافي نتائجك في صورة نصائح عملية، ويساعدك على التحضير لمراحل المباريات، ويكيف تشجيعه مع شعبة بكالوريتك (علوم رياضية، تجريبية، اقتصاد أو آداب)."
                : isAry
                  ? "رافي كايشرح ليك النتائج بنصائح عملية، كيعاونك توجد للكونكورات، وكايشجعك على حساب شعبة الباك ديالك (علوم رياضية، تجريبية، اقتصاد أو آداب)."
                  : isEn
                    ? "Rafi explains your results with actionable guidance, helps you prepare for exam milestones, and tailors recommendations to your Bac stream."
                    : "Rafi t'explique tes résultats en conseils pratiques, t'aide à préparer les étapes de concours et adapte ses encouragements à ta filière de Bac (Sciences Maths, PC, SVT ou Éco)."}
            </p>
          </article>
        </div>
      </section>
    </PageContainer>
  );
}
