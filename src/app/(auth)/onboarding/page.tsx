import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/client/onboarding-wizard";

export default async function OnboardingPage() {
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

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.org_id)
    .single();

  if (!org) {
    redirect("/login");
  }

  // Already onboarded — skip wizard
  if (org.onboarding_completed) {
    redirect("/dashboard");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  // Find assigned PM (if any project has one)
  const projectsData = projects ?? [];
  const pmId = projectsData.find((p) => p.assigned_pm_id)?.assigned_pm_id ?? null;

  let assignedPm = null;
  if (pmId) {
    const { data: pm } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", pmId)
      .single();
    assignedPm = pm ?? null;
  }

  return (
    <OnboardingWizard
      org={org}
      userName={profile.name}
      projects={projectsData}
      assignedPm={assignedPm}
    />
  );
}
