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
  const { projectId, body: commentBody, targetType, targetId } = body as {
    projectId: string;
    body: string;
    targetType: "document" | "approval" | "milestone";
    targetId: string;
  };

  if (!projectId || !commentBody || !targetType || !targetId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Determine user_type by checking admin_users table
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  const userType: "admin" | "client" = adminUser ? "admin" : "client";

  // Get org_id for activity log
  let orgId = "";
  if (userType === "client") {
    const { data: clientUser } = await supabase
      .from("users")
      .select("org_id")
      .eq("id", user.id)
      .single();
    orgId = clientUser?.org_id ?? "";
  } else {
    // For admin, get org_id from the project
    const { data: project } = await supabase
      .from("projects")
      .select("org_id")
      .eq("id", projectId)
      .single();
    orgId = project?.org_id ?? "";
  }

  // Insert comment
  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert({
      project_id: projectId,
      user_id: user.id,
      user_type: userType,
      body: commentBody.trim(),
      target_type: targetType,
      target_id: targetId,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Log to activity_log
  await supabase.from("activity_log").insert({
    org_id: orgId,
    project_id: projectId,
    actor_id: user.id,
    actor_type: userType,
    action: "comment_added",
    details: {
      comment_id: comment.id,
      target_type: targetType,
      target_id: targetId,
    },
  });

  return NextResponse.json({ success: true, comment });
}
