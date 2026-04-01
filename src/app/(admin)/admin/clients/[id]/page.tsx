import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/admin/client-form";
import type { Organization } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (!org) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Client</h1>
      <ClientForm client={org as Organization} />
    </div>
  );
}
