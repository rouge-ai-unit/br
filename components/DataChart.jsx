"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function DataChart({ data, type }) {
  const chartData = useMemo(() => {
    const validData = data?.filter(
      (company) => company && company.companyName?.trim() !== ""
    );

    if (!validData || validData.length === 0) return [];

    if (type === "region" || type === "industry") {
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
    }

    if (type === "revenue") {
      return validData
        .filter(
          (company) => company.revenue && !isNaN(parseFloat(company.revenue))
        )
        .map((company) => ({
          name: company.companyName,
          value: parseFloat(company.revenue) / 1_000_000,
        }))
        .sort((a, b) => b.value - a.value);
    }

    if (type === "marketShare") {
      return validData
        .filter(
          (company) =>
            company.marketShare && !isNaN(parseFloat(company.marketShare))
        )
        .map((company) => ({
          name: company.companyName,
          value: parseFloat(company.marketShare),
        }))
        .sort((a, b) => b.value - a.value);
    }

    if (type === "employeeSize") {
      return validData
        .filter(
          (company) =>
            company.employeeCount && !isNaN(parseInt(company.employeeCount))
        )
        .map((company) => ({
          name: company.companyName,
          value: parseInt(company.employeeCount),
        }))
        .sort((a, b) => b.value - a.value);
    }

    if (type === "techStack") {
      const counts = validData.reduce((acc, company) => {
        if (Array.isArray(company.techStack)) {
          company.techStack.forEach((tech) => {
            if (tech?.trim() !== "") {
              acc[tech] = (acc[tech] || 0) + 1;
            }
          });
        }
        return acc;
      }, {});
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }

    return [];
  }, [data, type]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }

  // Pie Chart (with tooltip on hover only)
  if (["region", "industry", "techStack"].includes(type)) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Tooltip />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
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

  // Bar Chart
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={COLORS[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
