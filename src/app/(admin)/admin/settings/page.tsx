import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvailabilityForm } from "@/components/admin/availability-form";
import type { AvailabilitySlot } from "@/lib/calendar/client";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  // Get admin user record for calendar availability
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single();

  const initialAvailability = (adminUser?.calendar_availability as AvailabilitySlot[] | null) ?? null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>

      {/* Calendar Availability */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Calendar Availability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set your weekly availability for client meeting bookings. Clients will see 30-minute slots based on these windows.
          </p>
        </div>
        <AvailabilityForm adminId={user.id} initialAvailability={initialAvailability} />
      </div>

      {/* Zoho Configuration */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Zoho Integration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invoice sync configuration for Zoho Books.
          </p>
        </div>
        <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Endpoint:</span>{" "}
            <code className="text-xs bg-muted rounded px-1 py-0.5">/api/zoho/sync</code>
          </p>
          <p>
            <span className="font-medium text-foreground">Trigger:</span> Manual or scheduled cron
          </p>
          <p className="text-xs mt-2">
            Configure <code className="bg-muted rounded px-1 py-0.5">ZOHO_CLIENT_ID</code>,{" "}
            <code className="bg-muted rounded px-1 py-0.5">ZOHO_CLIENT_SECRET</code>, and{" "}
            <code className="bg-muted rounded px-1 py-0.5">ZOHO_REFRESH_TOKEN</code> in your environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
