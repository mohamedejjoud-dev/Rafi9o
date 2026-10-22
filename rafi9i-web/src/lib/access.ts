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

export function trialBadge(trial: TrialStatus | null | undefined): { label: string; className: string } {
  switch (trial?.status) {
    case "active":
      return {
        label: `Aperçu Premium · ${trial.daysRemaining}j`,
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "subscribed":
      return {
        label: "Premium",
        className: "bg-orange-600 text-white border-orange-600",
      };
    case "expired":
      return {
        label: "Aperçu expiré",
        className: "bg-stone-100 text-stone-600 border-stone-200",
      };
    default:
      return {
        label: "Plan gratuit",
        className: "bg-stone-100 text-stone-600 border-stone-200",
      };
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
