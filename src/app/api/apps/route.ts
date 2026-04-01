import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, adminUser: null, supabase };

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  return { user, adminUser, supabase };
}

export async function POST(request: Request) {
  const { user, adminUser, supabase } = await getAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { orgId, label, url, icon, sortOrder } = body as {
    orgId: string;
    label: string;
    url: string;
    icon?: string;
    sortOrder?: number;
  };

  if (!orgId || !label || !url) {
    return NextResponse.json({ error: "Missing required fields: orgId, label, url" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("app_shortcuts")
    .insert({
      org_id: orgId,
      label,
      url,
      icon: icon ?? "link",
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shortcut: data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ?id= query parameter" }, { status: 400 });
  }

  const { user, adminUser, supabase } = await getAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("app_shortcuts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
