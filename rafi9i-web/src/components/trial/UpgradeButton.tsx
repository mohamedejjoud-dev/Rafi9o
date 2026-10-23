/**
 * Rafi9i — Upgrade button: Premium is paid by bank transfer over WhatsApp.
 * Opens a prefilled WhatsApp chat and records a pending request that an
 * admin approves once the transfer is verified.
 */
"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { whatsAppPremiumUrl } from "@/lib/premium";
import type { TrialStatus } from "@/lib/types";

export default function UpgradeButton({
  className = "",
  label,
  size,
  variant,
  onRequested,
}: {
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  onRequested?: (status: TrialStatus) => void;
}) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const { session } = useSession();

  if (!session) {
    return (
      <Button asChild size={size} variant={variant} className={`gap-2 ${className}`}>
        <Link href="/auth/login">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {label ?? t("premium.cta.login")}
        </Link>
      </Button>
    );
  }

  const recordRequest = () => {
    // The link itself opens WhatsApp; recording the request must not block it.
    api.premium
      .request()
      .then((status) => {
        toast({ title: t("premium.toast.title"), description: t("premium.toast.text") });
        onRequested?.(status);
      })
      .catch(() => toast({ title: t("premium.toast.error"), variant: "destructive" }));
  };

  return (
    <Button asChild size={size} variant={variant} className={`gap-2 ${className}`}>
      <a href={whatsAppPremiumUrl(locale, session.user)} target="_blank" rel="noopener noreferrer" onClick={recordRequest}>
        <MessageCircle className="h-4 w-4" aria-hidden />
        {label ?? t("premium.cta.whatsapp")}
      </a>
    </Button>
  );
}
