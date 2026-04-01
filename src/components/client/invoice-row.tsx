import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { INVOICE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Invoice } from "@/lib/supabase/types";

interface InvoiceRowProps {
  invoice: Invoice;
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const statusConfig = INVOICE_STATUSES[invoice.status];
  const isUnpaid = invoice.status !== "paid";

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: invoice.currency ?? "INR",
    maximumFractionDigits: 0,
  }).format(invoice.amount);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {invoice.invoice_number}
        </p>
        {invoice.due_date && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Due {formatDate(invoice.due_date)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formattedAmount}
        </span>

        <StatusBadge label={statusConfig.label} color={statusConfig.color} />

        {isUnpaid && invoice.payment_url ? (
          <a
            href={invoice.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Pay
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : isUnpaid ? (
          <span className="w-[60px]" />
        ) : null}
      </div>
    </div>
  );
}
