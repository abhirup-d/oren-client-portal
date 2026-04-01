"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, CheckSquare, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TypeBadge } from "@/components/shared/type-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PhaseTimeline } from "@/components/client/phase-timeline";
import { DocumentRow } from "@/components/client/document-row";
import { ApprovalCard } from "@/components/client/approval-card";
import { CommentThread } from "@/components/client/comment-thread";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PROJECT_TYPES, PROJECT_STATUSES } from "@/lib/constants";
import type { Project, Document, Approval } from "@/lib/supabase/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: proj } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!proj) {
      router.push("/projects");
      return;
    }

    const [{ data: docs }, { data: approvalsData }] = await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("approvals")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

    setProject(proj);
    setDocuments(docs ?? []);
    setApprovals(approvalsData ?? []);
    setLoading(false);
  }, [id, router, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDownload(doc: Document) {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  async function handleApprovalDecision(
    approvalId: string,
    status: "approved" | "rejected",
    comment: string
  ) {
    const response = await fetch(`/api/approvals/${approvalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment }),
    });

    if (response.ok) {
      // Refresh approvals
      const { data: approvalsData } = await supabase
        .from("approvals")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      setApprovals(approvalsData ?? []);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!project) return null;

  const typeConfig = PROJECT_TYPES[project.type];
  const statusConfig = PROJECT_STATUSES[project.status];
  const deliverables = documents.filter((d) => d.type === "deliverable");
  const workingDocs = documents.filter((d) => d.type === "working_doc");
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
          <TypeBadge label={typeConfig.label} color={typeConfig.color} />
          <StatusBadge label={statusConfig.label} color={statusConfig.color} />
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
      </div>

      {/* Phase timeline */}
      {project.phases.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Project Progress</h2>
          <PhaseTimeline phases={project.phases} />
        </div>
      )}

      {/* Tabs */}
      <div>
        <Tabs defaultValue="deliverables">
          <TabsList>
            <TabsTrigger value="deliverables">
              Deliverables ({deliverables.length})
            </TabsTrigger>
            <TabsTrigger value="working">
              Working Docs ({workingDocs.length})
            </TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-1.5 rounded-full bg-orange-500 text-white text-xs px-1.5 py-0.5 leading-none">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliverables" className="mt-4">
            {deliverables.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No deliverables yet"
                description="Deliverable documents will appear here as Oren completes project milestones."
              />
            ) : (
              <div className="space-y-2">
                {deliverables.map((doc) => (
                  <DocumentRow key={doc.id} document={doc} onDownload={handleDownload} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="working" className="mt-4">
            {workingDocs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No working documents"
                description="Working documents shared during the project will appear here."
              />
            ) : (
              <div className="space-y-2">
                {workingDocs.map((doc) => (
                  <DocumentRow key={doc.id} document={doc} onDownload={handleDownload} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approvals" className="mt-4">
            {approvals.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No approvals yet"
                description="Approval requests from Oren will appear here for your review."
              />
            ) : (
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    projectTitle={project.title}
                    onDecision={handleApprovalDecision}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Project Discussion
              </h3>
              <CommentThread
                projectId={id}
                targetType="milestone"
                targetId={id}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
