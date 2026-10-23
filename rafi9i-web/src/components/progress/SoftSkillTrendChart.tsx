/**
 * Rafi9i — Soft-skills progress line chart (lazy-loaded by the soft-skills page).
 */
"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_THEME } from "@/lib/chart-theme";

export default function SoftSkillTrendChart({
  data,
  avgLabel,
}: {
  data: { week: string; level: number }[];
  avgLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: CHART_THEME.tick }}
          tickLine={false}
          axisLine={{ stroke: CHART_THEME.grid }}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_THEME.tick }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={CHART_THEME.tooltip}
          labelStyle={{ color: "var(--popover-foreground)" }}
          formatter={(value: number) => [`${value}/100`, avgLabel]}
        />
        <Line type="monotone" dataKey="level" stroke="#f88541" strokeWidth={2.5} dot={{ r: 3, fill: "#f88541" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
