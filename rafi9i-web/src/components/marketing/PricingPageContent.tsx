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
          price={t("pub.price.free")}
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
          price={t("premium.price")}
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
          cta={{ href: "/trial", label: t("pricing.startTrial") }}
          highlighted
          badge={t("pricing.available")}
        />
      </div>

      <section
        aria-labelledby="preview-titre"
        className="rafi-card mx-auto mt-10 flex max-w-4xl flex-col items-start gap-5 !border-orange-200 !bg-orange-50 p-7 sm:flex-row sm:items-center dark:!border-orange-900/50 dark:!bg-orange-950/30"
      >
        <span className="rafi-icon-chip shrink-0" aria-hidden>
          <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </span>
        <div>
          <h2 id="preview-titre" className="text-lg font-bold text-foreground">
            {t("pricing.preview.title")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("pricing.preview.body")}
          </p>
        </div>
      </section>

      <p className="mx-auto mt-6 flex max-w-4xl items-start gap-3 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-sm">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
        <span>
          <strong className="text-foreground">{t("pricing.payment.title")}</strong>{" "}
          {t("pricing.payment.body")}
        </span>
      </p>

      <section id="faq" aria-labelledby="faq-titre" className="mt-20 scroll-mt-20">
        <SectionHeading eyebrow={t("pricing.faq.eyebrow")} title={t("pricing.faq.title")} />
        <div className="mx-auto mt-10 max-w-3xl space-y-3.5">
          {faq.map((entry) => (
            <details
              key={entry.question}
              className="rafi-card group px-6 py-4.5 transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground">
                {entry.question}
                <span className="text-xl font-bold text-orange-600 transition-transform dark:text-orange-400 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="my-20 text-center">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">{t("pricing.final.title")}</h2>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href={PRODUCT_ROUTES.register} size="lg">
            {t("pricing.final.button")}
          </PrimaryButton>
        </div>
      </section>
    </PageContainer>
  );
}
