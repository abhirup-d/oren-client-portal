"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APPROVAL_TYPES } from "@/lib/constants";
import type { Project, Document } from "@/lib/supabase/types";

type ProjectWithOrg = Project & { orgName: string };

interface ApprovalFormProps {
  projects: ProjectWithOrg[];
  adminUserId: string;
}

export function ApprovalForm({ projects, adminUserId }: ApprovalFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<keyof typeof APPROVAL_TYPES>("deliverable");
  const [linkedDocumentId, setLinkedDocumentId] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents when project changes
  useEffect(() => {
    if (!projectId) {
      setDocuments([]);
      setLinkedDocumentId("");
      return;
    }

    supabase
      .from("documents")
      .select("*")
      .eq("project_id", projectId)
      .order("title")
      .then(({ data }) => {
        setDocuments(data ?? []);
        setLinkedDocumentId("");
      });
  }, [projectId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Insert the approval
      const { data: approval, error: insertError } = await supabase
        .from("approvals")
        .insert({
          project_id: projectId,
          title,
          description: description || null,
          type,
          status: "pending",
          requested_by: adminUserId,
          linked_document_id: linkedDocumentId || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get org_id for activity log and notifications
      const selectedProject = projects.find((p) => p.id === projectId);
      const orgId = selectedProject?.org_id ?? "";

      // Log to activity_log
      await supabase.from("activity_log").insert({
        org_id: orgId,
        project_id: projectId,
        actor_id: adminUserId,
        actor_type: "admin",
        action: "approval_created",
        details: { approval_id: approval.id, approval_title: title },
      });

      // Notify all org users
      const { data: orgUsers } = await supabase
        .from("users")
        .select("id")
        .eq("org_id", orgId);

      if (orgUsers && orgUsers.length > 0) {
        const notifications = orgUsers.map((u) => ({
          user_id: u.id,
          title: "New approval request",
          body: `"${title}" requires your approval.`,
          link: `/approvals`,
          read: false,
          channels_sent: ["in_app"],
        }));

        await supabase.from("notifications").insert(notifications);
      }

      router.push("/admin/approvals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Project <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.orgName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. Approve Q1 DMA Report"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Optional — provide context for the client"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Type <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={type}
          onChange={(e) => setType(e.target.value as keyof typeof APPROVAL_TYPES)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(APPROVAL_TYPES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Linked Document{" "}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <select
          value={linkedDocumentId}
          onChange={(e) => setLinkedDocumentId(e.target.value)}
          disabled={!projectId || documents.length === 0}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">
            {!projectId
              ? "Select a project first"
              : documents.length === 0
              ? "No documents in this project"
              : "None"}
          </option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Create Approval"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/approvals")}
          className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
