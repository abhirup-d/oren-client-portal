import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TypeBadge } from "@/components/shared/type-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { APPROVAL_TYPES, APPROVAL_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function AdminApprovalsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: approvals } = await supabase
    .from("approvals")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = approvals ?? [];

  // Build project map for titles
  const projectIds = [...new Set(rows.map((a) => a.project_id))];
  const projectMap: Record<string, string> = {};

  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .in("id", projectIds);

    for (const p of projects ?? []) {
      projectMap[p.id] = p.title;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <Link
          href="/admin/approvals/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Approval
        </Link>
      </div>

      <div className="rounded-md border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Project
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No approvals yet. Create one to get started.
                </td>
              </tr>
            )}
            {rows.map((approval) => {
              const typeInfo =
                APPROVAL_TYPES[approval.type as keyof typeof APPROVAL_TYPES];
              const statusInfo =
                APPROVAL_STATUSES[
                  approval.status as keyof typeof APPROVAL_STATUSES
                ];
              return (
                <tr
                  key={approval.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {approval.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {projectMap[approval.project_id] ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeInfo && (
                      <TypeBadge label={typeInfo.label} color={typeInfo.color} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {statusInfo && (
                      <StatusBadge
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(approval.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
