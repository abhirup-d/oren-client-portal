import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, name")
    .eq("id", user.id)
    .single();

  if (!adminUser) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar adminName={adminUser.name} />
      <main className="flex flex-1 flex-col pl-60 p-6">{children}</main>
    </div>
  );
}
