import Link from "next/link";
import { Users, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Team Members */}
        <Link href="/settings/team">
          <div className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Team Members</h2>
                <p className="text-xs text-muted-foreground">Invite and manage your team</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Add or remove members from your organization. Owners can invite new team members via email.
            </p>
          </div>
        </Link>

        {/* Notifications — disabled, coming Phase 3 */}
        <div className="rounded-lg border bg-card p-6 opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">Coming in Phase 3</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure email and WhatsApp notification preferences for project updates.
          </p>
        </div>
      </div>
    </div>
  );
}
