import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, CheckCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/client/project-card";
import { DigestCard } from "@/components/client/digest-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const firstName = profile.name.split(" ")[0];

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  const activeProjects = (projects ?? []).filter((p) => p.status === "active");

  // Fetch pending approvals count for this org's projects
  const projectIds = (projects ?? []).map((p) => p.id);
  let pendingApprovalsCount = 0;
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .eq("status", "pending");
    pendingApprovalsCount = count ?? 0;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeProjects.length} active{" "}
          {activeProjects.length === 1 ? "project" : "projects"} in progress
        </p>
      </div>

      {/* Quick action: pending approvals */}
      {pendingApprovalsCount > 0 && (
        <Link href="/approvals">
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-950/50">
            <CheckCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {pendingApprovalsCount}{" "}
              {pendingApprovalsCount === 1 ? "approval" : "approvals"} need your attention
            </p>
          </div>
        </Link>
      )}

      {/* Smart digest */}
      <DigestCard />

      {/* Projects grid */}
      {(projects ?? []).length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Your ESG projects will appear here once Oren sets them up for you."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
