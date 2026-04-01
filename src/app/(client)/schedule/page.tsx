import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MeetingBooking } from "@/components/client/meeting-booking";
import { MEETING_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's org_id
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const orgId = profile.org_id;

  // Fetch PMs (admin_users with role=pm)
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("*")
    .in("role", ["admin", "pm"])
    .order("name");

  // Fetch user's active projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .eq("status", "active")
    .order("title");

  // Fetch recent meetings
  const { data: recentMeetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("org_id", orgId)
    .order("scheduled_at", { ascending: false })
    .limit(5);

  const pms = adminUsers ?? [];
  const projects = projectsData ?? [];
  const meetings = recentMeetings ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Schedule a Meeting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Book a 30-minute session with your project manager
        </p>
      </div>

      {pms.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No project managers available at the moment.
          </p>
        </div>
      ) : (
        <MeetingBooking pms={pms} projects={projects} />
      )}

      {/* Recent Meetings */}
      {meetings.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Meetings</h2>
          <div className="space-y-2">
            {meetings.map((meeting) => {
              const statusConfig = MEETING_STATUSES[meeting.status];
              return (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(meeting.scheduled_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
