"use client";

import { useI18n } from "@/lib/i18n";

export default function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#contenu-principal" className="rf-skip-link">
      {t("nav.skip")}
    </a>
  );
}
