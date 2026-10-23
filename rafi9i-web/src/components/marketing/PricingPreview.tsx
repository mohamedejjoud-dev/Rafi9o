/**
 * Rafi9i — PricingPreview (Educational Edition)
 * Two clear plans, three lines each.
 */
"use client";

import PageContainer from "@/components/shared/PageContainer";
import PricingCard from "@/components/shared/PricingCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";

export default function PricingPreview() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="tarifs-titre" className="py-20 sm:py-24">
      <PageContainer>
        <SectionHeading id="tarifs-titre" eyebrow={t("pricing.home.eyebrow")} title={t("home.pricing.title")} />
        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-8 md:grid-cols-2">
          <PricingCard
            name={t("pricing.home.free.name")}
            price={t("pub.price.free")}
            pricePeriod={t("pricing.freePeriod")}
            description={t("pricing.home.free.description")}
            features={[
              t("pricing.free.feature1"),
              t("pricing.free.feature2"),
              t("pricing.free.feature3"),
            ]}
            cta={{ href: PRODUCT_ROUTES.register, label: t("pricing.home.free.button") }}
          />
          <PricingCard
            name={t("pricing.home.premium.name")}
            price={t("premium.price")}
            pricePeriod={t("pricing.month")}
            recommendationLabel={t("pricing.recommended")}
            description={t("pricing.home.premium.description")}
            features={[
              t("pricing.home.premium.feature2"),
              t("pricing.home.premium.feature4"),
              t("pricing.home.premium.feature5"),
            ]}
            cta={{ href: "/pricing", label: t("pricing.home.premium.button") }}
            highlighted
            badge={t("pricing.available")}
          />
        </div>
      </PageContainer>
    </section>
  );
}
