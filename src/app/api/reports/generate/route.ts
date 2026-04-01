import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    active: "#16a34a",
    completed: "#2563eb",
    approved: "#16a34a",
    pending: "#d97706",
    rejected: "#dc2626",
    draft: "#6b7280",
    review: "#7c3aed",
    final: "#2563eb",
    on_hold: "#d97706",
    cancelled: "#dc2626",
  };
  const color = colors[status] ?? "#6b7280";
  return `<span style="background:${color}1a;color:${color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;text-transform:capitalize">${status.replace("_", " ")}</span>`;
}

function buildProgressReport({
  project,
  documents,
  approvals,
  period,
}: {
  project: { title: string; type: string; status: string; current_phase: string | null; phases: Array<{ name: string; status: string; order: number; started_at: string | null; completed_at: string | null }>; start_date: string | null; target_end_date: string | null; description: string | null };
  documents: Array<{ title: string; status: string; type: string; version: number; created_at: string }>;
  approvals: Array<{ title: string; status: string; type: string; created_at: string; decided_at: string | null }>;
  period: string;
}): string {
  const sortedPhases = [...project.phases].sort((a, b) => a.order - b.order);
  const completedPhases = sortedPhases.filter((p) => p.status === "completed").length;
  const progressPct = sortedPhases.length > 0 ? Math.round((completedPhases / sortedPhases.length) * 100) : 0;

  const phasesRows = sortedPhases
    .map(
      (p) =>
        `<tr>
          <td>${p.order + 1}. ${p.name}</td>
          <td>${statusBadge(p.status)}</td>
          <td>${formatDate(p.started_at)}</td>
          <td>${formatDate(p.completed_at)}</td>
        </tr>`
    )
    .join("");

  const docRows =
    documents.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#6b7280">No documents yet</td></tr>`
      : documents
          .map(
            (d) =>
              `<tr>
                <td>${d.title}</td>
                <td>${statusBadge(d.status)}</td>
                <td style="text-transform:capitalize">${d.type.replace("_", " ")}</td>
                <td>${formatDate(d.created_at)}</td>
              </tr>`
          )
          .join("");

  const approvalRows =
    approvals.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#6b7280">No approvals yet</td></tr>`
      : approvals
          .map(
            (a) =>
              `<tr>
                <td>${a.title}</td>
                <td>${statusBadge(a.status)}</td>
                <td style="text-transform:capitalize">${a.type.replace("_", " ")}</td>
                <td>${formatDate(a.decided_at ?? a.created_at)}</td>
              </tr>`
          )
          .join("");

  return `
    <section>
      <h2>Project Overview</h2>
      <table class="info-table">
        <tr><td><strong>Project</strong></td><td>${project.title}</td></tr>
        <tr><td><strong>Type</strong></td><td style="text-transform:capitalize">${project.type.replace("_", " ")}</td></tr>
        <tr><td><strong>Status</strong></td><td>${statusBadge(project.status)}</td></tr>
        <tr><td><strong>Start Date</strong></td><td>${formatDate(project.start_date)}</td></tr>
        <tr><td><strong>Target End Date</strong></td><td>${formatDate(project.target_end_date)}</td></tr>
        <tr><td><strong>Current Phase</strong></td><td>${project.current_phase ?? "—"}</td></tr>
        <tr><td><strong>Overall Progress</strong></td><td>${progressPct}% (${completedPhases} of ${sortedPhases.length} phases complete)</td></tr>
      </table>
    </section>

    <section>
      <h2>Phase Progress</h2>
      <table>
        <thead><tr><th>Phase</th><th>Status</th><th>Started</th><th>Completed</th></tr></thead>
        <tbody>${phasesRows}</tbody>
      </table>
    </section>

    <section>
      <h2>Documents</h2>
      <table>
        <thead><tr><th>Title</th><th>Status</th><th>Type</th><th>Uploaded</th></tr></thead>
        <tbody>${docRows}</tbody>
      </table>
    </section>

    <section>
      <h2>Approvals</h2>
      <table>
        <thead><tr><th>Title</th><th>Status</th><th>Type</th><th>Date</th></tr></thead>
        <tbody>${approvalRows}</tbody>
      </table>
    </section>
  `;
}

function buildEsgReport({
  project,
  metrics,
  period,
}: {
  project: { title: string; type: string; status: string };
  metrics: Array<{ metric_name: string; value: number; unit: string | null; period: string; source: string; recorded_at: string }>;
  period: string;
}): string {
  const metricRows =
    metrics.length === 0
      ? `<tr><td colspan="5" style="text-align:center;color:#6b7280">No ESG metrics recorded for this period</td></tr>`
      : metrics
          .map(
            (m) =>
              `<tr>
                <td>${m.metric_name}</td>
                <td style="text-align:right;font-weight:600">${m.value.toLocaleString("en-IN")}</td>
                <td>${m.unit ?? "—"}</td>
                <td>${m.period}</td>
                <td style="text-transform:capitalize">${m.source}</td>
              </tr>`
          )
          .join("");

  // Group by category prefix (e.g. "GHG - Scope 1" → "GHG")
  const categories = new Set<string>();
  for (const m of metrics) {
    const cat = m.metric_name.split(/[-–:]/)[0].trim();
    categories.add(cat);
  }

  const categorySummary =
    categories.size === 0
      ? ""
      : `<section>
          <h2>Metric Categories Covered</h2>
          <ul style="padding-left:1.5em;color:#374151">
            ${[...categories].map((c) => `<li>${c}</li>`).join("")}
          </ul>
        </section>`;

  return `
    <section>
      <h2>Project Overview</h2>
      <table class="info-table">
        <tr><td><strong>Project</strong></td><td>${project.title}</td></tr>
        <tr><td><strong>Type</strong></td><td style="text-transform:capitalize">${project.type.replace("_", " ")}</td></tr>
        <tr><td><strong>Report Period</strong></td><td>${period}</td></tr>
        <tr><td><strong>Total Metrics</strong></td><td>${metrics.length}</td></tr>
      </table>
    </section>

    ${categorySummary}

    <section>
      <h2>ESG Metrics</h2>
      <table>
        <thead><tr><th>Metric</th><th style="text-align:right">Value</th><th>Unit</th><th>Period</th><th>Source</th></tr></thead>
        <tbody>${metricRows}</tbody>
      </table>
    </section>
  `;
}

function wrapHtml(title: string, content: string, reportType: string): string {
  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; padding: 40px; font-size: 13px; line-height: 1.6; }
    header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 32px; }
    header h1 { font-size: 20px; font-weight: 700; color: #111827; }
    header .meta { text-align: right; font-size: 11px; color: #6b7280; }
    .report-type-badge { display: inline-block; background: #16a34a1a; color: #16a34a; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    section { margin-bottom: 32px; }
    h2 { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f9fafb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; border: 1px solid #e5e7eb; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; color: #374151; vertical-align: middle; }
    tr:nth-child(even) td { background: #f9fafb; }
    table.info-table td:first-child { font-weight: 500; color: #6b7280; width: 180px; }
    footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print {
      body { padding: 20px; }
      header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .report-type-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      span[style*="background"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="report-type-badge">${reportType === "esg" ? "ESG Report" : "Progress Report"}</div>
      <h1>${title}</h1>
    </div>
    <div class="meta">
      <div><strong>Oren</strong> — Maroon Oak Technologies</div>
      <div>Generated: ${generatedOn}</div>
      <div style="margin-top:8px;font-size:10px;color:#d1d5db">Use browser Print → Save as PDF</div>
    </div>
  </header>

  ${content}

  <footer>
    This report was generated by the Oren Client Portal. Confidential — for internal use only.
  </footer>
</body>
</html>`;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, reportType, period } = body as {
    projectId?: string;
    reportType?: "progress" | "esg";
    period?: string;
  };

  if (!projectId || !reportType) {
    return NextResponse.json({ error: "Missing required fields: projectId, reportType" }, { status: 400 });
  }

  // Verify user has access to this project's org
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  // Also allow admin users
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Access control
  if (!adminUser && profile?.org_id !== project.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let bodyHtml: string;
  const reportPeriod = period ?? "All time";

  if (reportType === "progress") {
    const [{ data: documents }, { data: approvals }] = await Promise.all([
      supabase.from("documents").select("title,status,type,version,created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("approvals").select("title,status,type,created_at,decided_at").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);

    bodyHtml = buildProgressReport({
      project,
      documents: documents ?? [],
      approvals: approvals ?? [],
      period: reportPeriod,
    });
  } else {
    const metricsQuery = supabase
      .from("esg_metrics")
      .select("metric_name,value,unit,period,source,recorded_at")
      .eq("project_id", projectId)
      .order("metric_name", { ascending: true });

    if (period) {
      metricsQuery.eq("period", period);
    }

    const { data: metrics } = await metricsQuery;

    bodyHtml = buildEsgReport({
      project,
      metrics: metrics ?? [],
      period: reportPeriod,
    });
  }

  const html = wrapHtml(project.title, bodyHtml, reportType);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
