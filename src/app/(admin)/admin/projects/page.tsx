import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TypeBadge } from "@/components/shared/type-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PROJECT_TYPES, PROJECT_STATUSES } from "@/lib/constants";

export default async function AdminProjectsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name");

  const orgMap: Record<string, string> = {};
  for (const org of organizations ?? []) {
    orgMap[org.id] = org.name;
  }

  const rows = projects ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Project
        </Link>
      </div>

      <div className="rounded-md border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Project</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phase</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No projects yet. Create one to get started.
                </td>
              </tr>
            )}
            {rows.map((project) => {
              const typeInfo = PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES];
              const statusInfo = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];
              return (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{project.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {orgMap[project.org_id] ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeInfo && (
                      <TypeBadge label={typeInfo.label} color={typeInfo.color} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {statusInfo && (
                      <StatusBadge label={statusInfo.label} color={statusInfo.color} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {project.current_phase ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}/documents`}
                        className="text-muted-foreground hover:underline text-sm"
                      >
                        Docs
                      </Link>
                    </div>
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
