import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
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

  // Verify caller is org owner
  const { data: callerProfile } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "owner") {
    return NextResponse.json({ error: "Forbidden: only org owners can remove members" }, { status: 403 });
  }

  // Fetch target user profile
  const { data: targetProfile } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("id", id)
    .single();

  if (!targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify target is in the same org
  if (targetProfile.org_id !== callerProfile.org_id) {
    return NextResponse.json({ error: "Forbidden: user is not in your organization" }, { status: 403 });
  }

  // Prevent removing another owner
  if (targetProfile.role === "owner") {
    return NextResponse.json({ error: "Cannot remove an org owner" }, { status: 403 });
  }

  const serviceClient = await createServiceRoleClient();

  // Delete the user profile
  const { error: deleteError } = await serviceClient
    .from("users")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
