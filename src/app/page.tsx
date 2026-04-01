import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (adminUser) {
    redirect("/admin/clients");
  }

  redirect("/dashboard");
}
