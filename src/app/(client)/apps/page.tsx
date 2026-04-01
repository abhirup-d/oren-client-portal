import { redirect } from "next/navigation";
import { Grid3X3 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppShortcutCard } from "@/components/client/app-shortcut-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AppsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const { data: shortcuts } = await supabase
    .from("app_shortcuts")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("sort_order", { ascending: true });

  const appShortcuts = shortcuts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Apps &amp; Links</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quick access to tools and resources for your projects
        </p>
      </div>

      {appShortcuts.length === 0 ? (
        <EmptyState
          icon={Grid3X3}
          title="No shortcuts yet"
          description="Your team will add app shortcuts and useful links here for quick access."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {appShortcuts.map((shortcut) => (
            <AppShortcutCard key={shortcut.id} shortcut={shortcut} />
          ))}
        </div>
      )}
    </div>
  );
}
