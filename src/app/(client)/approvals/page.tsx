"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ApprovalCard } from "@/components/client/approval-card";
import { EmptyState } from "@/components/shared/empty-state";
import { APPROVAL_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Approval } from "@/lib/supabase/types";

type ApprovalWithProject = Approval & { projectTitle: string };

export default function ApprovalsPage() {
  const [allApprovals, setAllApprovals] = useState<ApprovalWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const supabase = createClient();

  const fetchApprovals = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("org_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile) return;

    // Fetch projects for this org
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .eq("org_id", profile.org_id);

    if (!projects || projects.length === 0) {
      setLoading(false);
      return;
    }

    const projectIds = projects.map((p) => p.id);
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

    const { data: approvals } = await supabase
      .from("approvals")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });

    const withProject: ApprovalWithProject[] = (approvals ?? []).map((a) => ({
      ...a,
      projectTitle: projectMap[a.project_id] ?? "Unknown Project",
    }));

    setAllApprovals(withProject);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  async function handleDecision(
    id: string,
    status: "approved" | "rejected",
    comment: string
  ) {
    const res = await fetch(`/api/approvals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment }),
    });

    if (res.ok) {
      // Refresh list from server
      await fetchApprovals();
    }
  }

  const filtered = allApprovals.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  const selectClass = cn(
    "h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
    "dark:bg-input/30"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and respond to approval requests from Oren
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {Object.entries(APPROVAL_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={
            allApprovals.length === 0
              ? "No approval requests yet"
              : "No results found"
          }
          description={
            allApprovals.length === 0
              ? "Approval requests from Oren will appear here."
              : "Try adjusting your filter."
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              projectTitle={approval.projectTitle}
              onDecision={handleDecision}
            />
          ))}
        </div>
      )}
    </div>
  );
}
