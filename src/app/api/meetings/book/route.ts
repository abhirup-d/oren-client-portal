import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pmId, scheduledAt, title, notes, projectId } = body as {
    pmId: string;
    scheduledAt: string;
    title: string;
    notes?: string;
    projectId?: string;
  };

  if (!pmId || !scheduledAt || !title) {
    return NextResponse.json(
      { error: "pmId, scheduledAt, and title are required" },
      { status: 400 }
    );
  }

  // Get user's org_id
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  const orgId = profile.org_id;

  // Insert meeting record
  const { data: meeting, error: insertError } = await supabase
    .from("meetings")
    .insert({
      org_id: orgId,
      project_id: projectId ?? null,
      title: title.trim(),
      scheduled_at: scheduledAt,
      duration_minutes: 30,
      booked_by: user.id,
      pm_id: pmId,
      status: "scheduled",
      notes: notes?.trim() ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    org_id: orgId,
    project_id: projectId ?? null,
    actor_id: user.id,
    actor_type: "client",
    action: "meeting_booked",
    details: {
      meeting_id: meeting.id,
      meeting_title: title,
      scheduled_at: scheduledAt,
      pm_id: pmId,
    },
  });

  return NextResponse.json({ success: true, meeting });
}
