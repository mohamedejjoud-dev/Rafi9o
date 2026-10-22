"use client";

import { CreditCard, Timer } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import SectionHeading from "@/components/shared/SectionHeading";
import PricingCard from "@/components/shared/PricingCard";
import { PrimaryButton } from "@/components/shared/Buttons";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";

export default function PricingPageContent() {
  const { t } = useI18n();
  const faq = Array.from({ length: 6 }, (_, index) => ({
    question: t(`pricing.faq.q${index + 1}`),
    answer: t(`pricing.faq.a${index + 1}`),
  }));

  return (
    <PageContainer className="pt-8">
      <Breadcrumbs
        items={[
          { name: t("nav.home"), path: "/" },
          { name: t("nav.pricing"), path: "/pricing" },
        ]}
      />

      <SectionHeading
        as="h1"
        eyebrow={t("pricing.eyebrow")}
        title={t("pricing.title")}
        description={t("pricing.description")}
      />

      <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        <PricingCard
          name={t("pricing.free.name")}
          price="0 DH"
          pricePeriod={t("pricing.freePeriod")}
          description={t("pricing.free.description")}
          features={[
            t("pricing.free.feature1"),
            t("pricing.free.feature2"),
            t("pricing.free.feature3"),
            t("pricing.free.feature4"),
            t("pricing.free.feature5"),
          ]}
          cta={{ href: PRODUCT_ROUTES.register, label: t("pricing.createAccount") }}
        />
        <PricingCard
          name={t("pricing.premium.name")}
          price="19 DH"
          pricePeriod={t("pricing.month")}
          recommendationLabel={t("pricing.recommended")}
          description={t("pricing.premium.description")}
          features={[
            t("pricing.premium.feature1"),
            t("pricing.premium.feature2"),
            t("pricing.premium.feature3"),
            t("pricing.premium.feature4"),
            t("pricing.premium.feature5"),
            t("pricing.premium.feature6"),
            t("pricing.premium.feature7"),
          ]}
          cta={{ href: PRODUCT_ROUTES.register, label: t("pricing.startTrial") }}
          highlighted
          badge={t("pricing.available")}
        />
      </div>

      <section
        aria-labelledby="preview-titre"
        className="rafi-card mx-auto mt-10 flex max-w-4xl flex-col items-start gap-5 border-indigo-500/20 bg-slate-900/80 p-7 sm:flex-row sm:items-center"
      >
        <span className="rafi-icon-chip shrink-0" aria-hidden>
          <Timer className="h-5 w-5 text-cyan-300" />
        </span>
        <div>
          <h2 id="preview-titre" className="text-lg font-bold text-white">
            {t("pricing.preview.title")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
            {t("pricing.preview.body")}
          </p>
        </div>
      </section>

      <p className="mx-auto mt-6 flex max-w-4xl items-start gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 text-xs leading-relaxed text-slate-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
        <span>
          <strong className="text-white">{t("pricing.payment.title")}</strong>{" "}
          {t("pricing.payment.body")}
        </span>
      </p>

      <section id="faq" aria-labelledby="faq-titre" className="mt-20 scroll-mt-20">
        <SectionHeading eyebrow={t("pricing.faq.eyebrow")} title={t("pricing.faq.title")} />
        <div className="mx-auto mt-10 max-w-3xl space-y-3.5">
          {faq.map((entry) => (
            <details
              key={entry.question}
              className="rafi-card group border-white/10 bg-slate-900/60 px-6 py-4.5 transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-white">
                {entry.question}
                <span className="text-xl font-bold text-cyan-400 transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3.5 text-sm leading-relaxed text-slate-300/85">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="my-20 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t("pricing.final.title")}</h2>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href={PRODUCT_ROUTES.register} size="lg">
            {t("pricing.final.button")}
          </PrimaryButton>
        </div>
      </section>
    </PageContainer>
  );
}
