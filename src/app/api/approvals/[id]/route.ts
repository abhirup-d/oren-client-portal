import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status, comment } = body as { status: string; comment?: string };

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "Status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  // Fetch the approval to verify it's pending and get project_id
  const { data: approval, error: fetchError } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !approval) {
    return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  }

  if (approval.status !== "pending") {
    return NextResponse.json(
      { error: "Approval has already been decided" },
      { status: 409 }
    );
  }

  // Update the approval
  const { data: updated, error: updateError } = await supabase
    .from("approvals")
    .update({
      status: status as "approved" | "rejected",
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Determine org_id via the project
  const { data: project } = await supabase
    .from("projects")
    .select("org_id")
    .eq("id", approval.project_id)
    .single();

  const orgId = project?.org_id ?? "";

  // Log to activity_log
  await supabase.from("activity_log").insert({
    org_id: orgId,
    project_id: approval.project_id,
    actor_id: user.id,
    actor_type: "client",
    action: `approval_${status}`,
    details: { approval_id: id, approval_title: approval.title },
  });

  // If comment provided, insert a comment record
  if (comment && comment.trim() !== "") {
    await supabase.from("comments").insert({
      project_id: approval.project_id,
      user_id: user.id,
      user_type: "client",
      body: comment.trim(),
      target_type: "approval",
      target_id: id,
    });
  }

  return NextResponse.json(updated);
}
