/**
 * Rafi9i — Chart theme + label helpers. Kept free of recharts so pages can
 * import them without pulling the chart library into their bundle.
 */

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Localize demo week labels ("S-3", "Cette sem.") for chart axes. */
export function localizeWeekLabel(week: string, t: Translate): string {
  const match = /^S-(\d+)$/.exec(week);
  if (match) return t("dsh.chart.weekAgo", { n: match[1] });
  if (week === "Cette sem.") return t("dsh.chart.thisWeek");
  return week;
}

/** Theme-aware chart colors (CSS variables from globals.css). */
export const CHART_THEME = {
  grid: "var(--border)",
  tick: "var(--muted-foreground)",
  tooltip: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
} as const;
