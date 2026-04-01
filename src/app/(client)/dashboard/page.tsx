import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
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
