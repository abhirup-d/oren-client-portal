"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { InvoiceRow } from "@/components/client/invoice-row";
import { EmptyState } from "@/components/shared/empty-state";
import type { Invoice } from "@/lib/supabase/types";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("due_date", { ascending: false });

      setInvoices(data ?? []);
      setLoading(false);
    }

    loadInvoices();
  }, []);

  const currentYear = new Date().getFullYear();

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue" || inv.status === "partially_paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaidThisYear = invoices
    .filter(
      (inv) =>
        inv.status === "paid" &&
        inv.due_date &&
        new Date(inv.due_date).getFullYear() === currentYear
    )
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and pay your invoices
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Outstanding
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {loading ? "—" : formatINR(totalOutstanding)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Paid This Year ({currentYear})
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {loading ? "—" : formatINR(totalPaidThisYear)}
          </p>
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Your invoices will appear here once Oren creates them."
        />
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
