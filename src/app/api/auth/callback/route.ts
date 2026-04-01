import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      if (type === "admin") {
        return NextResponse.redirect(`${origin}/admin/clients`);
      }

      // For non-admin users, check if their org needs onboarding
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: org } = await supabase
            .from("organizations")
            .select("onboarding_completed")
            .eq("id", profile.org_id)
            .single();

          if (org && !org.onboarding_completed) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
