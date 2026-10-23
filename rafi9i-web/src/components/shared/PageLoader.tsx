/**
 * Rafi9i — Page loader with Rafi thinking (Developer 2)
 */
"use client";

import { Loader2 } from "lucide-react";
import FoxGuide from "@/components/fox/FoxGuide";
import { useI18n } from "@/lib/i18n";

export default function PageLoader({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6" role="status" aria-live="polite">
      <FoxGuide stage="dashboard" mood="thinking" message={message ?? t("pub.pageLoader.default")} compact />
      <Loader2 className="h-5 w-5 animate-spin text-orange-600 dark:text-orange-400" aria-hidden />
    </div>
  );
}
