import type { Invoice } from "@/lib/supabase/types";

// Zoho invoice status → our DB status
const ZOHO_STATUS_MAP: Record<
  string,
  Invoice["status"]
> = {
  sent: "pending",
  overdue: "overdue",
  paid: "paid",
  partially_paid: "partially_paid",
  draft: "pending",
  void: "paid", // treat voided as paid for display
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });

  const res = await fetch(
    `https://accounts.zoho.in/oauth/v2/token?${params.toString()}`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`Zoho OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return cachedToken;
}

export interface ZohoInvoiceRecord {
  id: string; // zoho_invoice_id
  invoice_number: string;
  total: number;
  currency_code: string;
  status: string;
  due_date: string | null;
  payment_made: number;
  invoice_url: string | null;
  customer_id: string;
}

export async function fetchInvoices(): Promise<ZohoInvoiceRecord[]> {
  if (!process.env.ZOHO_CLIENT_ID) {
    return [];
  }

  const token = await getAccessToken();
  const orgId = process.env.ZOHO_ORG_ID!;

  const res = await fetch(
    `https://www.zohoapis.in/books/v3/invoices?organization_id=${orgId}&per_page=200`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Zoho Invoices API failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    invoices: Array<{
      invoice_id: string;
      invoice_number: string;
      total: number;
      currency_code: string;
      status: string;
      due_date: string;
      payment_made: number;
      invoice_url: string | null;
      customer_id: string;
    }>;
  };

  return (data.invoices ?? []).map((inv) => ({
    id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    total: inv.total,
    currency_code: inv.currency_code,
    status: inv.status,
    due_date: inv.due_date || null,
    payment_made: inv.payment_made,
    invoice_url: inv.invoice_url,
    customer_id: inv.customer_id,
  }));
}

export function mapZohoStatus(zohoStatus: string): Invoice["status"] {
  return ZOHO_STATUS_MAP[zohoStatus.toLowerCase()] ?? "pending";
}
