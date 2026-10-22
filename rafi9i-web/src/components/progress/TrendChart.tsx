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

export interface TrendChartProps {
  data: { week: string; activity: number }[];
  label: string;
}

export default function TrendChart({ data, label }: TrendChartProps) {
  return (
    <div className="h-56 w-full" role="img" aria-label={`Graphique : ${label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={{ stroke: "#E7E5E4" }} />
          <YAxis tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #FED7AA",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            formatter={(value: number) => [`${value}`, label]}
          />
          <Bar dataKey="activity" fill="#f88541" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
