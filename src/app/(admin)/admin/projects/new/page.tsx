import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const [{ data: organizations }, { data: adminUsers }] = await Promise.all([
    supabase.from("organizations").select("*").order("name"),
    supabase.from("admin_users").select("*").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Project</h1>
      <ProjectForm
        organizations={organizations ?? []}
        adminUsers={adminUsers ?? []}
      />
    </div>
  );
}
