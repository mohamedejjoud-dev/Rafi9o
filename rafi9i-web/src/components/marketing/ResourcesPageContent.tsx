"use client";

import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SectionHeading from "@/components/shared/SectionHeading";
import ResourcesExplorer from "@/components/marketing/ResourcesExplorer";
import { useI18n } from "@/lib/i18n";

export default function ResourcesPageContent() {
  const { t } = useI18n();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: t("nav.home"), path: "/" },
          { name: t("nav.resources"), path: "/resources" },
        ]}
      />
      <SectionHeading
        as="h1"
        eyebrow={t("resources.eyebrow")}
        title={t("resources.title")}
        description={t("resources.description")}
      />
      <div className="mt-10">
        <ResourcesExplorer />
      </div>
    </>
  );
}
