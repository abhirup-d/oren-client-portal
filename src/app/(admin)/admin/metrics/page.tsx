import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MetricsForm } from "@/components/admin/metrics-form";

export default async function AdminMetricsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  // Fetch all projects with org names
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .order("title");

  const projects = projectsData ?? [];

  // Fetch all organizations to join org names
  const { data: orgsData } = await supabase
    .from("organizations")
    .select("id, name");

  const orgMap: Record<string, string> = {};
  for (const org of orgsData ?? []) {
    orgMap[org.id] = org.name;
  }

  const projectsWithOrg = projects.map((p) => ({
    ...p,
    org_name: orgMap[p.org_id] ?? "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ESG Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record and manage ESG metrics for client projects
        </p>
      </div>

      {projectsWithOrg.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No projects found.</p>
        </div>
      ) : (
        <MetricsForm projects={projectsWithOrg} />
      )}
    </div>
  );
}
