import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateDigest } from "@/lib/ai/digest";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile with org_id and last_login_at
  const { data: profile } = await supabase
    .from("users")
    .select("org_id, last_login_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  const { org_id, last_login_at } = profile;
  const periodStart = last_login_at ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const periodEnd = new Date().toISOString();

  // Check digest_cache first
  const { data: cached } = await supabase
    .from("digest_cache")
    .select("*")
    .eq("user_id", user.id)
    .eq("period_start", periodStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (cached) {
    return NextResponse.json({ digest: cached.summary, cached: true });
  }

  // Fetch last 20 activity_log entries since last login
  const { data: activities } = await supabase
    .from("activity_log")
    .select("action, details, created_at")
    .eq("org_id", org_id)
    .gte("created_at", periodStart)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!activities || activities.length === 0) {
    return NextResponse.json({
      digest: "No new activity since your last visit.",
      cached: false,
    });
  }

  // Fetch project names for context
  const projectIds = [
    ...new Set(
      activities
        .map((a) => a.details?.project_id as string | undefined)
        .filter((id): id is string => !!id)
    ),
  ];

  const projectNames = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .in("id", projectIds);

    (projects ?? []).forEach((p) => projectNames.set(p.id, p.title));
  }

  let digest: string;
  try {
    digest = await generateDigest(activities, projectNames);
  } catch {
    // Fallback to simple count message if AI call fails
    digest = `You have ${activities.length} new update${activities.length !== 1 ? "s" : ""} since your last visit.`;
  }

  // Cache the result
  await supabase.from("digest_cache").insert({
    user_id: user.id,
    period_start: periodStart,
    period_end: periodEnd,
    summary: digest,
  });

  return NextResponse.json({ digest, cached: false });
}
