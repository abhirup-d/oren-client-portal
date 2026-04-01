import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/client/sidebar";
import { Topbar } from "@/components/client/topbar";
import type { Organization } from "@/lib/supabase/types";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id, name, org_id")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    redirect("/login");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", userProfile.org_id)
    .single();

  if (!org) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar org={org as Organization} userName={userProfile.name} />
      <div className="flex flex-1 flex-col pl-60">
        <Topbar userId={user.id} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
