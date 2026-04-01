import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWhatsApp } from "@/lib/whatsapp/send";

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
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { to, message } = body as { to?: string; message?: string };

  if (!to || !message) {
    return NextResponse.json({ error: "Missing required fields: to, message" }, { status: 400 });
  }

  const result = await sendWhatsApp({ to, message });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ success: true, messageId: result.messageId });
}
