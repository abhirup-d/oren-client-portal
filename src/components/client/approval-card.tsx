"use client";

import { useState } from "react";
import { TypeBadge } from "@/components/shared/type-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { APPROVAL_TYPES, APPROVAL_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Approval } from "@/lib/supabase/types";

interface ApprovalCardProps {
  approval: Approval;
  projectTitle: string;
  onDecision: (id: string, status: "approved" | "rejected", comment: string) => Promise<void>;
}

export function ApprovalCard({ approval, projectTitle, onDecision }: ApprovalCardProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const typeInfo = APPROVAL_TYPES[approval.type as keyof typeof APPROVAL_TYPES];
  const statusInfo = APPROVAL_STATUSES[approval.status as keyof typeof APPROVAL_STATUSES];
  const isPending = approval.status === "pending";

  async function handleDecision(status: "approved" | "rejected") {
    setLoading(true);
    try {
      await onDecision(approval.id, status, comment);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{approval.title}</h3>
          <p className="text-xs text-muted-foreground">{projectTitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {typeInfo && <TypeBadge label={typeInfo.label} color={typeInfo.color} />}
          {statusInfo && <StatusBadge label={statusInfo.label} color={statusInfo.color} />}
        </div>
      </div>

      {/* Description */}
      {approval.description && (
        <p className="text-sm text-muted-foreground">{approval.description}</p>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        Requested {formatDate(approval.created_at)}
      </p>

      {/* Decision area — only for pending */}
      {isPending && (
        <div className="space-y-3 pt-2 border-t border-border">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Optional comment…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision("approved")}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision("rejected")}
              disabled={loading}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
