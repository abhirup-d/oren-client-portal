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

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, orgId, role } = body as {
    email: string;
    name: string;
    orgId: string;
    role: "owner" | "member";
  };

  if (!email || !name || !orgId || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceClient = await createServiceRoleClient();

  const { data: invited, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const newUserId = invited.user.id;

  const { error: profileError } = await serviceClient.from("users").insert({
    id: newUserId,
    org_id: orgId,
    email,
    name,
    role,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: newUserId });
}
