"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Project, EsgMetric } from "@/lib/supabase/types";

interface ProjectWithOrg extends Project {
  org_name: string;
}

interface MetricsFormProps {
  projects: ProjectWithOrg[];
}

export function MetricsForm({ projects }: MetricsFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? "");
  const [metrics, setMetrics] = useState<EsgMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // New metric form state
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("");
  const [metricPeriod, setMetricPeriod] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!selectedProjectId) return;

    setLoadingMetrics(true);
    setMetrics([]);

    supabase
      .from("esg_metrics")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("recorded_at", { ascending: false })
      .then(({ data }) => {
        setMetrics(data ?? []);
        setLoadingMetrics(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  async function handleAdd() {
    if (!metricName.trim() || !metricValue || !metricPeriod.trim()) return;

    const parsed = parseFloat(metricValue);
    if (isNaN(parsed)) {
      setAddError("Value must be a number");
      return;
    }

    setAdding(true);
    setAddError(null);

    const { data, error } = await supabase
      .from("esg_metrics")
      .insert({
        project_id: selectedProjectId,
        metric_name: metricName.trim(),
        value: parsed,
        unit: metricUnit.trim() || null,
        period: metricPeriod.trim(),
        source: "manual",
      })
      .select()
      .single();

    if (error) {
      setAddError(error.message);
    } else if (data) {
      setMetrics([data, ...metrics]);
      setMetricName("");
      setMetricValue("");
      setMetricUnit("");
      setMetricPeriod("");
    }

    setAdding(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("esg_metrics").delete().eq("id", id);
    if (!error) {
      setMetrics(metrics.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-muted-foreground">Select Project</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.org_name}
            </option>
          ))}
        </select>
      </div>

      {/* Add metric form */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Add Metric</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Metric Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="e.g. GHG Emissions"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="e.g. 1234.5"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Unit (optional)
            </label>
            <input
              type="text"
              value={metricUnit}
              onChange={(e) => setMetricUnit(e.target.value)}
              placeholder="e.g. tCO2e, kWh"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Period <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={metricPeriod}
              onChange={(e) => setMetricPeriod(e.target.value)}
              placeholder="e.g. FY2024, Q1 2025"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {addError && <p className="text-sm text-red-500">{addError}</p>}

        <button
          onClick={handleAdd}
          disabled={!metricName.trim() || !metricValue || !metricPeriod.trim() || adding}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" />
          {adding ? "Adding..." : "Add Metric"}
        </button>
      </div>

      {/* Metrics list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            Recorded Metrics {!loadingMetrics && `(${metrics.length})`}
          </h2>
        </div>

        {loadingMetrics ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : metrics.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No metrics recorded yet for this project.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Metric</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Period</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium text-foreground">{m.metric_name}</td>
                  <td className="px-4 py-2 text-right text-foreground tabular-nums">{m.value}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.unit ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.period}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.source === "computed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {m.source}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete metric"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
