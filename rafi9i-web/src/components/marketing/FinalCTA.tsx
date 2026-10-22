/**
 * Rafi9i — FinalCTA
 * One line, one button.
 */
"use client";

import PageContainer from "@/components/shared/PageContainer";
import { PrimaryButton } from "@/components/shared/Buttons";
import RafiLogo from "@/components/ui/RafiLogo";
import { PRODUCT_ROUTES } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function FinalCTA() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="cta-finale-titre" className="pb-24 pt-4">
      <PageContainer>
        <div className="flex flex-col items-center rounded-3xl bg-orange-500 px-6 py-16 text-center sm:px-12 sm:py-20">
          <span className="rf-float flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
            <RafiLogo iconOnly size={72} />
          </span>

          <h2
            id="cta-finale-titre"
            className="mt-8 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]"
          >
            {t("cta.title")} {t("cta.titleAccent")}.
          </h2>

          <p className="mt-4 text-sm font-semibold text-slate-900/70">{t("cta.badge")}</p>

          <PrimaryButton
            href={PRODUCT_ROUTES.register}
            size="lg"
            className="mt-8 w-full border-slate-950! bg-slate-950! text-white! hover:bg-slate-800! sm:w-auto"
          >
            <span>{t("cta.button")}</span>
            <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
          </PrimaryButton>
        </div>
      </PageContainer>
    </section>
  );
}
