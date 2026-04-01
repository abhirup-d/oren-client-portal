"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EsgMetric } from "@/lib/supabase/types";

interface MetricsLineChartProps {
  title: string;
  metrics: EsgMetric[];
  color?: string;
}

interface MetricsBarChartProps {
  title: string;
  metrics: EsgMetric[];
  color?: string;
}

interface MetricsSummaryProps {
  metrics: EsgMetric[];
}

function formatValue(value: number, unit: string | null): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M${unit ? ` ${unit}` : ""}`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K${unit ? ` ${unit}` : ""}`;
  }
  return `${value}${unit ? ` ${unit}` : ""}`;
}

export function MetricsLineChart({ title, metrics, color = "#10b981" }: MetricsLineChartProps) {
  const data = [...metrics]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((m) => ({
      period: m.period,
      value: m.value,
      unit: m.unit,
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value, _name, props) => [
              formatValue(Number(value ?? 0), (props as { payload?: { unit?: string | null } }).payload?.unit ?? null),
              "Value",
            ]}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="value"
            name={title}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricsBarChart({ title, metrics, color = "#6366f1" }: MetricsBarChartProps) {
  const data = [...metrics]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((m) => ({
      period: m.period,
      value: m.value,
      unit: m.unit,
      name: m.metric_name,
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value, _name, props) => [
              formatValue(Number(value ?? 0), (props as { payload?: { unit?: string | null } }).payload?.unit ?? null),
              "Value",
            ]}
          />
          <Bar dataKey="value" name={title} fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricsSummary({ metrics }: MetricsSummaryProps) {
  // Get latest value per metric name
  const latestByName: Record<string, EsgMetric> = {};
  for (const m of metrics) {
    const existing = latestByName[m.metric_name];
    if (!existing || m.period > existing.period) {
      latestByName[m.metric_name] = m;
    }
  }

  const latest = Object.values(latestByName);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {latest.map((m) => (
        <div
          key={m.metric_name}
          className="rounded-lg border border-border bg-card p-3 space-y-1"
        >
          <p className="text-xs font-medium text-muted-foreground truncate" title={m.metric_name}>
            {m.metric_name}
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatValue(m.value, m.unit)}
          </p>
          <p className="text-xs text-muted-foreground">{m.period}</p>
        </div>
      ))}
    </div>
  );
}
