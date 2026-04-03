import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  ENGAGEMENT_TYPES,
} from "@/lib/constants";
import { formatDate, formatFileSize } from "@/lib/utils";
import { FileText, FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Document } from "@/lib/supabase/types";
import { DocumentActions, DownloadButton } from "./document-actions";

type DocumentWithProject = Document & { projectTitle: string | null };

export default async function DocumentsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const orgId = profile.org_id;

  // Fetch all documents for this org
  const { data: allDocs } = await supabase
    .from("documents")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  // Fetch projects for this org (needed for project title mapping and upload form)
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("org_id", orgId)
    .order("title", { ascending: true });

  const projectMap = Object.fromEntries(
    (projects ?? []).map((p) => [p.id, p.title])
  );

  const documents: DocumentWithProject[] = (allDocs ?? []).map((doc) => ({
    ...doc,
    projectTitle: doc.project_id ? (projectMap[doc.project_id] ?? null) : null,
  }));

  // Split into engagement and project documents
  const engagementDocs = documents.filter((d) => d.category === "engagement");
  const projectDocs = documents.filter((d) => d.category === "project");

  // Group project docs by project
  const projectGroups: Record<string, { title: string; docs: DocumentWithProject[] }> = {};
  for (const doc of projectDocs) {
    const key = doc.project_id ?? "unknown";
    if (!projectGroups[key]) {
      projectGroups[key] = {
        title: doc.projectTitle ?? "Unknown Project",
        docs: [],
      };
    }
    projectGroups[key].docs.push(doc);
  }

  const projectList = (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All documents across your engagements and projects
          </p>
        </div>
        <DocumentActions projects={projectList} />
      </div>

      {/* Group 1: Engagement Documents */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Engagement Documents ({engagementDocs.length})
        </h2>

        {engagementDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No engagement documents"
            description="Organization-level documents like purchase orders, NDAs, and contracts will appear here."
          />
        ) : (
          <div className="space-y-2">
            {engagementDocs.map((doc) => (
              <EngagementDocRow key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {/* Group 2: Project Documents */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Project Documents ({projectDocs.length})
        </h2>

        {projectDocs.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No project documents"
            description="Documents related to your projects will appear here."
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(projectGroups).map(([projectId, group]) => (
              <ProjectSection
                key={projectId}
                title={group.title}
                documents={group.docs}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Engagement document row ──────────────────────────────────────────

function EngagementDocRow({ document: doc }: { document: DocumentWithProject }) {
  const statusConfig = DOCUMENT_STATUSES[doc.status];
  const engagementLabel = doc.engagement_type
    ? ENGAGEMENT_TYPES[doc.engagement_type]?.label ?? "Other"
    : "Other";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {engagementLabel}
          </span>
          <p className="text-sm font-medium text-foreground truncate">
            {doc.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatFileSize(doc.file_size)} &middot; {formatDate(doc.created_at)}
        </p>
      </div>

      <div className="flex-shrink-0">
        <StatusBadge label={statusConfig.label} color={statusConfig.color} />
      </div>

      <DownloadButton filePath={doc.file_path} title={doc.title} />
    </div>
  );
}

// ── Collapsible project section ──────────────────────────────────────

function ProjectSection({
  title,
  documents,
}: {
  title: string;
  documents: DocumentWithProject[];
}) {
  return (
    <details className="group rounded-lg border border-border bg-card" open>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 select-none list-none [&::-webkit-details-marker]:hidden">
        <svg
          className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          ({documents.length})
        </span>
      </summary>
      <div className="border-t border-border px-4 pb-3 pt-2 space-y-2">
        {documents.map((doc) => (
          <ProjectDocRow key={doc.id} document={doc} />
        ))}
      </div>
    </details>
  );
}

// ── Project document row ─────────────────────────────────────────────

function ProjectDocRow({ document: doc }: { document: DocumentWithProject }) {
  const statusConfig = DOCUMENT_STATUSES[doc.status];
  const typeConfig = DOCUMENT_TYPES[doc.type];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 hover:border-border/80 transition-colors">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {typeConfig.label}
          </span>
          <p className="text-sm font-medium text-foreground truncate">
            {doc.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          v{doc.version} &middot; {formatFileSize(doc.file_size)} &middot;{" "}
          {formatDate(doc.created_at)}
        </p>
      </div>

      <div className="flex-shrink-0">
        <StatusBadge label={statusConfig.label} color={statusConfig.color} />
      </div>

      <DownloadButton filePath={doc.file_path} title={doc.title} />
    </div>
  );
}

