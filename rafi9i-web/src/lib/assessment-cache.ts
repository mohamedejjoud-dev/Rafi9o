/**
 * Rafi9i — Assessment question cache
 * The question catalog is loaded once per browser session (and language) so
 * refreshing or revisiting the quiz doesn't reload it. Cleared after a
 * submission so the "completed" state comes back from the API.
 */
import type { AssessmentOverview } from "./types";

type AssessmentKind = "basic" | "advanced";

const cacheKey = (kind: AssessmentKind, locale: string) => `rafi9i:assess:${kind}:overview:${locale}`;

export function readCachedOverview(kind: AssessmentKind, locale: string): AssessmentOverview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKey(kind, locale));
    return raw ? (JSON.parse(raw) as AssessmentOverview) : null;
  } catch {
    return null;
  }
}

export function writeCachedOverview(kind: AssessmentKind, locale: string, overview: AssessmentOverview): void {
  try {
    window.sessionStorage.setItem(cacheKey(kind, locale), JSON.stringify(overview));
  } catch {
    /* storage full or disabled: the quiz still works without the cache */
  }
}

export function clearCachedOverview(kind: AssessmentKind): void {
  try {
    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith(`rafi9i:assess:${kind}:overview:`)) window.sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
