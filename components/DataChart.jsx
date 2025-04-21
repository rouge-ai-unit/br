"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function DataChart({ data, type }) {
  const chartData = useMemo(() => {
    // Only process region or industryFocus types
    if (!["region", "industry"].includes(type)) return [];

    const validData = data?.filter(
      (company) => company && company.companyName?.trim() !== ""
    );

    if (!validData || validData.length === 0) return [];

    const counts = validData.reduce((acc, company) => {
      const key = type === "region" ? company.region : company.industryFocus;
      if (key?.trim() !== "") {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data, type]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }

  // Render Pie Chart (only for region and industryFocus)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
