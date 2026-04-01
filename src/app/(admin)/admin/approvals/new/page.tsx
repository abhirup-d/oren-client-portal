import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApprovalForm } from "@/components/admin/approval-form";
import type { Project } from "@/lib/supabase/types";

type ProjectWithOrg = Project & { orgName: string };

export default async function NewApprovalPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const [{ data: projects }, { data: organizations }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .order("title"),
    supabase.from("organizations").select("id, name"),
  ]);

  const orgMap: Record<string, string> = {};
  for (const org of organizations ?? []) {
    orgMap[org.id] = org.name;
  }

  const projectsWithOrg: ProjectWithOrg[] = (projects ?? []).map((p) => ({
    ...p,
    orgName: orgMap[p.org_id] ?? "Unknown",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Approval</h1>
      <ApprovalForm projects={projectsWithOrg} adminUserId={user.id} />
    </div>
  );
}
