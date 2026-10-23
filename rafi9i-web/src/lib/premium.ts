/**
 * Rafi9i — Premium via WhatsApp
 * -------------------------------------------
 * There is no online payment: the student sends a WhatsApp message, makes a
 * bank transfer, and an admin activates Premium once the transfer is verified.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { useSession } from "./auth-client";
import { isPremiumAccess } from "./access";
import type { Locale } from "./i18n";
import type { TrialStatus } from "./types";

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "212657726718").replace(/\D/g, "");
export const PREMIUM_PRICE_DH = 19;

const MESSAGES: Record<Locale, (name: string, email: string) => string> = {
  fr: (name, email) =>
    `Salam ! Je souhaite activer Rafi9i Premium (${PREMIUM_PRICE_DH} DH).\nNom : ${name}\nEmail du compte : ${email}\nJe vous envoie la preuve de virement ici.`,
  en: (name, email) =>
    `Hi! I'd like to activate Rafi9i Premium (${PREMIUM_PRICE_DH} DH).\nName: ${name}\nAccount email: ${email}\nI'll send the transfer receipt here.`,
  ar: (name, email) =>
    `السلام عليكم! أرغب في تفعيل رفيقي بريميوم (${PREMIUM_PRICE_DH} درهم).\nالاسم: ${name}\nبريد الحساب: ${email}\nسأرسل إثبات التحويل هنا.`,
};

/** Long date in the UI language (Arabic uses Moroccan Arabic formatting). */
export function formatPremiumDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const intlLocale = locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
  try {
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** wa.me deep link with a prefilled message identifying the account to activate. */
export function whatsAppPremiumUrl(locale: Locale, user?: { name?: string; email?: string } | null): string {
  const text = MESSAGES[locale](user?.name ?? "—", user?.email ?? "—");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* Several components on one page ask for the Premium status at mount (page
   banner, chat, badges); share one request for a few seconds instead. */
const STATUS_TTL_MS = 10_000;
let statusCache: { token: string; at: number; promise: Promise<TrialStatus> } | null = null;

function fetchStatus(token: string, force: boolean): Promise<TrialStatus> {
  if (!force && statusCache && statusCache.token === token && Date.now() - statusCache.at < STATUS_TTL_MS) {
    return statusCache.promise;
  }
  const promise = api.trial.status();
  statusCache = { token, at: Date.now(), promise };
  promise.catch(() => {
    statusCache = null;
  });
  return promise;
}

/**
 * Current user's Premium state. Guests are treated as free; the status is
 * re-read from the API so an admin activation shows up without re-login.
 */
export function usePremium(): {
  trial: TrialStatus | null;
  isPremium: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { session, loading: sessionLoading } = useSession();
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force: boolean) => {
    if (!session) {
      setTrial(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setTrial(await fetchStatus(session.token, force));
    } catch {
      setTrial(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    if (!sessionLoading) void load(false);
  }, [sessionLoading, load]);

  return { trial, isPremium: isPremiumAccess(trial), loading: sessionLoading || loading, refresh };
}
