import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalCard } from "@/components/client/approval-card";
import type { Approval } from "@/lib/supabase/types";

const baseApproval: Approval = {
  id: "a1",
  project_id: "p1",
  title: "Approve Q1 DMA Report",
  description: "Please review and approve",
  type: "deliverable",
  status: "pending",
  requested_by: "admin1",
  decided_by: null,
  decided_at: null,
  linked_document_id: null,
  created_at: "2026-04-01T10:00:00Z",
};

describe("ApprovalCard", () => {
  it("renders approval title", () => {
    render(
      <ApprovalCard
        approval={baseApproval}
        projectTitle="Q1 DMA Project"
        onDecision={vi.fn()}
      />
    );
    expect(screen.getByText("Approve Q1 DMA Report")).toBeDefined();
  });

  it("shows approve and reject buttons for pending approvals", () => {
    render(
      <ApprovalCard
        approval={baseApproval}
        projectTitle="Q1 DMA Project"
        onDecision={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /approve/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /reject/i })).toBeDefined();
  });

  it("hides approve/reject buttons for decided approvals", () => {
    const decided: Approval = {
      ...baseApproval,
      status: "approved",
      decided_by: "user1",
      decided_at: "2026-04-01T11:00:00Z",
    };
    render(
      <ApprovalCard
        approval={decided}
        projectTitle="Q1 DMA Project"
        onDecision={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: /approve/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reject/i })).toBeNull();
  });
});
