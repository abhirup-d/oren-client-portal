import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminClientsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  const orgs = organizations ?? [];

  // Fetch user counts per org
  const { data: userCounts } = await supabase
    .from("users")
    .select("org_id");

  const countMap: Record<string, number> = {};
  for (const u of userCounts ?? []) {
    countMap[u.org_id] = (countMap[u.org_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Client
        </Link>
      </div>

      <div className="rounded-md border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Users</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Onboarded</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No clients yet. Add one to get started.
                </td>
              </tr>
            )}
            {orgs.map((org) => (
              <tr key={org.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{org.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{countMap[org.id] ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(org.created_at)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      org.onboarding_completed
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {org.onboarding_completed ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${org.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
