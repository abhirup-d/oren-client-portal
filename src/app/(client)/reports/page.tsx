"use client";

import { useState, useEffect } from "react";
import { FileDown, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";

const REPORT_TYPES = [
  { value: "progress", label: "Progress Report", description: "Phases, documents and approvals summary" },
  { value: "esg", label: "ESG Report", description: "Environmental, Social and Governance metrics" },
] as const;

const PERIOD_OPTIONS = [
  { value: "", label: "All time" },
  { value: "FY2024-25", label: "FY 2024-25" },
  { value: "FY2023-24", label: "FY 2023-24" },
  { value: "FY2022-23", label: "FY 2022-23" },
  { value: "Q1 2025", label: "Q1 2025" },
  { value: "Q2 2025", label: "Q2 2025" },
  { value: "Q3 2025", label: "Q3 2025" },
  { value: "Q4 2025", label: "Q4 2025" },
];

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [reportType, setReportType] = useState<"progress" | "esg">("progress");
  const [period, setPeriod] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("users")
        .select("org_id")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false });
      const list = projectData ?? [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    });
  }, []);

  async function handleGenerate() {
    if (!selectedProjectId) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          reportType,
          period: period || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to generate report");
        return;
      }

      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate project progress and ESG reports. Open in a new tab and use{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs font-mono">Print</kbd>{" "}
          to save as PDF.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6 max-w-lg">
        {/* Project selector */}
        <div className="space-y-2">
          <Label htmlFor="report-project">Project</Label>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects available.</p>
          ) : (
            <select
              id="report-project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Report type selector */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REPORT_TYPES.map((rt) => (
              <label
                key={rt.value}
                className={`flex flex-col gap-1 rounded-lg border p-3 cursor-pointer transition-colors ${
                  reportType === rt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <input
                  type="radio"
                  name="report-type"
                  value={rt.value}
                  checked={reportType === rt.value}
                  onChange={() => setReportType(rt.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-foreground">{rt.label}</span>
                <span className="text-xs text-muted-foreground">{rt.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div className="space-y-2">
          <Label htmlFor="report-period">Period</Label>
          <select
            id="report-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleGenerate}
          disabled={generating || !selectedProjectId}
          className="w-full flex items-center gap-2"
        >
          {generating ? (
            <>
              <FileBarChart2 className="h-4 w-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          The report will open in a new tab. Use your browser&apos;s Print function (Ctrl+P / Cmd+P) and choose &quot;Save as PDF&quot;.
        </p>
      </div>
    </div>
  );
}
