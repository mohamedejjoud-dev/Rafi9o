/**
 * Rafi9i — Access-level logic (Developer 2)
 * -------------------------------------------
 * Single source of truth for what each plan can see/do:
 * - free            : basic assessment, free result, limited dashboard
 * - premium_preview : + advanced assessment, detailed result, trial countdown
 * - premium         : full access marker (real payment NOT in MVP scope)
 */
import type { TrialStatus } from "./types";

export function isPremiumAccess(trial: TrialStatus | null | undefined): boolean {
  if (!trial) return false;
  return trial.status === "active" || trial.status === "subscribed";
}

export function canTakeAdvanced(trial: TrialStatus | null | undefined): boolean {
  return isPremiumAccess(trial);
}

export function canViewPremiumResult(trial: TrialStatus | null | undefined): boolean {
  return isPremiumAccess(trial);
}

export function dashboardIsLimited(trial: TrialStatus | null | undefined): boolean {
  return !trial || trial.accessLevel === "free";
}

type Translator = (key: string, vars?: Record<string, string | number>) => string;

/** French fallback so callers without a translator keep working. */
const FR_BADGE_LABELS: Record<string, string> = {
  "dsh.badge.active": "Aperçu Premium · {days}j",
  "dsh.badge.subscribed": "Premium",
  "dsh.badge.pending": "Vérification en cours",
  "dsh.badge.expired": "Aperçu expiré",
  "dsh.badge.free": "Plan gratuit",
};

const frTranslator: Translator = (key, vars) =>
  (FR_BADGE_LABELS[key] ?? key).replace(/\{(\w+)\}/g, (m, name: string) => (vars && name in vars ? String(vars[name]) : m));

const NEUTRAL_BADGE =
  "bg-stone-100 text-stone-600 border-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

/** Badge label + classes for a trial. Pass `t` from useI18n() to localize the label. */
export function trialBadge(
  trial: TrialStatus | null | undefined,
  t: Translator = frTranslator
): { label: string; className: string } {
  switch (trial?.status) {
    case "active":
      return {
        label: t("dsh.badge.active", { days: trial.daysRemaining }),
        className:
          "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
      };
    case "subscribed":
      return {
        label: t("dsh.badge.subscribed"),
        className: "bg-orange-600 text-white border-orange-600 dark:bg-orange-700 dark:border-orange-700",
      };
    case "pending":
      return {
        label: t("dsh.badge.pending"),
        className:
          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
      };
    case "expired":
      return { label: t("dsh.badge.expired"), className: NEUTRAL_BADGE };
    default:
      return { label: t("dsh.badge.free"), className: NEUTRAL_BADGE };
  }
}

type DateLocale = "fr" | "en" | "ar" | "ary";

function intlLocale(locale: DateLocale): string {
  return locale === "ar" || locale === "ary" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
}

export function formatDateTime(iso: string | null, locale: DateLocale = "fr"): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDate(iso: string | null, locale: DateLocale = "fr"): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
