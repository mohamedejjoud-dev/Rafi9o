/**
 * Rafi9i — ProductPillars
 * The three things a student gets, one line each.
 */
"use client";

import { Handshake, Route, School } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import { useI18n } from "@/lib/i18n";

const PILLARS = [
  { icon: School, title: "pillars.card1.title", text: "home.features.f1" },
  { icon: Handshake, title: "pillars.card2.title", text: "home.features.f2" },
  { icon: Route, title: "pillars.card3.title", text: "home.features.f3" },
] as const;

export default function ProductPillars() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="piliers-titre" className="py-20 sm:py-24">
      <PageContainer>
        <SectionHeading
          id="piliers-titre"
          eyebrow={t("home.features.eyebrow")}
          title={t("home.features.title")}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="rafi-card rafi-card-hover p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-slate-950" aria-hidden>
                <pillar.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-lg font-bold text-slate-950 dark:text-white">{t(pillar.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t(pillar.text)}</p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
