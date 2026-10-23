/**
 * Rafi9i — Weekly activity bar chart (Developer 2)
 * Lightweight recharts wrapper, warm orange palette.
 */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";

export interface TrendChartProps {
  data: { week: string; activity: number }[];
  label: string;
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

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

export default function TrendChart({ data, label }: TrendChartProps) {
  const { t } = useI18n();
  const localized = data.map((d) => ({ ...d, week: localizeWeekLabel(d.week, t) }));
  return (
    <div className="h-56 w-full" role="img" aria-label={t("dsh.chart.aria", { label })}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={localized} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: CHART_THEME.tick }}
            tickLine={false}
            axisLine={{ stroke: CHART_THEME.grid }}
          />
          <YAxis tick={{ fontSize: 11, fill: CHART_THEME.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
            contentStyle={CHART_THEME.tooltip}
            labelStyle={{ color: "var(--popover-foreground)" }}
            formatter={(value: number) => [`${value}`, label]}
          />
          <Bar dataKey="activity" fill="#f88541" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
