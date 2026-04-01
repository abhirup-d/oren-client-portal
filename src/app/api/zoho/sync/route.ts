import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchInvoices, mapZohoStatus } from "@/lib/zoho/client";

export async function GET(request: Request) {
  // Auth: accept CRON_SECRET header (for Vercel cron) OR a logged-in admin
  const cronSecret = request.headers.get("x-cron-secret");
  const isValidCron =
    process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    // Fall back to checking for an authenticated admin user
    const userClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser } = await userClient
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let zohoInvoices;
  try {
    zohoInvoices = await fetchInvoices();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (zohoInvoices.length === 0) {
    return NextResponse.json({ synced: 0, message: "No invoices from Zoho" });
  }

  const serviceClient = await createServiceRoleClient();

  // We need to map Zoho customer_id → our org_id.
  // Fetch all orgs to attempt a match, or skip org mapping if unknown.
  const { data: orgs } = await serviceClient
    .from("organizations")
    .select("id, name");

  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));

  let syncedCount = 0;

  for (const inv of zohoInvoices) {
    // Resolve org_id: use customer_id directly as org_id if it exists in our orgs table,
    // otherwise skip (can't upsert without org_id FK).
    const orgId = orgById.has(inv.customer_id) ? inv.customer_id : null;
    if (!orgId) continue;

    const upsertPayload = {
      org_id: orgId,
      zoho_invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      amount: inv.total,
      currency: inv.currency_code ?? "INR",
      status: mapZohoStatus(inv.status),
      due_date: inv.due_date,
      payment_url: inv.invoice_url,
      synced_at: new Date().toISOString(),
    };

    const { error } = await serviceClient
      .from("invoices")
      .upsert(upsertPayload, { onConflict: "zoho_invoice_id" });

    if (!error) {
      syncedCount++;
    }
  }

  return NextResponse.json({ synced: syncedCount });
}
