/**
 * Rafi9i — shared legal document body (client, follows the UI locale).
 * Sections are read from translation keys: `${prefix}.s{n}.title` and
 * `${prefix}.s{n}.p{m}`. `paragraphs[n - 1]` is the paragraph count of section n.
 */
"use client";

import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PageContainer from "@/components/shared/PageContainer";
import { useI18n } from "@/lib/i18n";

export default function LegalDocument({
  prefix,
  path,
  titleKey,
  breadcrumbKey,
  paragraphs,
}: {
  prefix: string;
  path: string;
  titleKey: string;
  breadcrumbKey: string;
  paragraphs: number[];
}) {
  const { t } = useI18n();

  return (
    <PageContainer className="pt-8">
      <Breadcrumbs
        items={[
          { name: t("nav.home"), path: "/" },
          { name: t(breadcrumbKey), path },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t(titleKey)}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("pub.legal.version")}</p>

        <div className="mt-10 space-y-8">
          {paragraphs.map((count, index) => {
            const section = `${prefix}.s${index + 1}`;
            const headingId = `${prefix.replace(/\W/g, "-")}-s${index + 1}`;
            return (
              <section key={section} aria-labelledby={headingId}>
                <h2 id={headingId} className="text-lg font-bold text-foreground">
                  {t(`${section}.title`)}
                </h2>
                <div className="mt-2.5 space-y-2.5">
                  {Array.from({ length: count }, (_, p) => (
                    <p key={p} className="text-sm leading-relaxed text-foreground/85">
                      {t(`${section}.p${p + 1}`)}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
