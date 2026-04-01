"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DocumentUpload } from "@/components/admin/document-upload";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants";
import { formatFileSize, formatDate } from "@/lib/utils";
import type { Document, Project } from "@/lib/supabase/types";

type DocumentStatus = "draft" | "review" | "approved" | "final";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProjectDocumentsPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setAdminUserId(user.id);

    const [{ data: proj }, { data: docs }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("documents")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);

    setProject(proj as Project | null);
    setDocuments((docs as Document[]) ?? []);
    setLoading(false);
  }, [supabase, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(docId: string, newStatus: DocumentStatus) {
    await supabase
      .from("documents")
      .update({ status: newStatus })
      .eq("id", docId);

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {project?.title ?? "Project"} — Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage documents for this project
        </p>
      </div>

      {adminUserId && project && (
        <DocumentUpload
          projectId={projectId}
          orgId={project.org_id}
          adminUserId={adminUserId}
          onUploaded={fetchData}
        />
      )}

      <div className="rounded-md border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Size</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No documents yet. Upload one above.
                </td>
              </tr>
            )}
            {documents.map((doc) => {
              const typeInfo =
                DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES];
              return (
                <tr
                  key={doc.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{doc.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {typeInfo?.label ?? doc.type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={doc.status}
                      onChange={(e) =>
                        handleStatusChange(doc.id, e.target.value as DocumentStatus)
                      }
                      className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
                    >
                      {Object.entries(DOCUMENT_STATUSES).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
