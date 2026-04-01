import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Forbidden: only org owners can invite members" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name } = body as { email: string; name: string };

  if (!email || !name) {
    return NextResponse.json({ error: "email and name are required" }, { status: 400 });
  }

  const serviceClient = await createServiceRoleClient();

  // Invite user via Supabase Auth
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const newUserId = inviteData.user.id;

  // Create user profile in users table
  const { error: profileError } = await serviceClient
    .from("users")
    .insert({
      id: newUserId,
      org_id: callerProfile.org_id,
      email,
      name,
      role: "member",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: newUserId });
}
