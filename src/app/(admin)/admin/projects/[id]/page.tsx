import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";
import type { Project } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const [{ data: project }, { data: organizations }, { data: adminUsers }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("organizations").select("*").order("name"),
      supabase.from("admin_users").select("*").order("name"),
    ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
      <ProjectForm
        project={project as Project}
        organizations={organizations ?? []}
        adminUsers={adminUsers ?? []}
      />
    </div>
  );
}
