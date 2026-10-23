/**
 * Rafi9i — HowItWorks
 * Three steps, a few words each.
 */
"use client";

import { ClipboardCheck, Flag, GraduationCap } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { icon: ClipboardCheck, title: "home.how.s1.title", text: "home.how.s1.text" },
  { icon: GraduationCap, title: "home.how.s2.title", text: "home.how.s2.text" },
  { icon: Flag, title: "home.how.s3.title", text: "home.how.s3.text" },
] as const;

export default function HowItWorks() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="etapes-titre" className="bg-stone-950 py-20 text-white sm:py-24">
      <PageContainer>
        <SectionHeading
          id="etapes-titre"
          eyebrow={t("home.how.eyebrow")}
          title={t("home.how.title")}
          tone="dark"
        />

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center text-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5" aria-hidden>
                <step.icon className="h-7 w-7 text-orange-400" />
                <span className="absolute -top-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-extrabold text-stone-950">
                  {index + 1}
                </span>
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{t(step.title)}</h3>
              <p className="mt-1.5 text-sm text-stone-300">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
