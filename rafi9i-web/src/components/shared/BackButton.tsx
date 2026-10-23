/**
 * Rafi9i — Back button: returns to the previous page, or to a fallback
 * route when the page was opened directly (no in-app history).
 */
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function BackButton({
  fallbackHref = "/dashboard",
  size,
  className = "",
}: {
  fallbackHref?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button type="button" variant="outline" size={size} onClick={goBack} className={`gap-1.5 ${className}`}>
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
      {t("common.back")}
    </Button>
  );
}
