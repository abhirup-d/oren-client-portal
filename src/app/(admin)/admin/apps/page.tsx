import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppShortcutManager } from "@/components/admin/app-shortcut-form";

export default async function AdminAppsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!adminUser) redirect("/admin-login");

  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  const orgs = organizations ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">App Shortcuts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage quick-access links shown to each client organisation
        </p>
      </div>

      <AppShortcutManager orgs={orgs} />
    </div>
  );
}
