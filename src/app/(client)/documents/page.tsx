"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DocumentRow } from "@/components/client/document-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Document } from "@/lib/supabase/types";

type DocumentWithProject = Document & { projectTitle: string };

export default function DocumentsPage() {
  const [allDocuments, setAllDocuments] = useState<DocumentWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("org_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile) return;

    // Fetch projects for this org
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title")
      .eq("org_id", profile.org_id);

    if (!projects || projects.length === 0) {
      setLoading(false);
      return;
    }

    const projectIds = projects.map((p) => p.id);
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });

    const withProject: DocumentWithProject[] = (docs ?? []).map((doc) => ({
      ...doc,
      projectTitle: projectMap[doc.project_id] ?? "Unknown Project",
    }));

    setAllDocuments(withProject);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleDownload(doc: Document) {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  const filtered = allDocuments.filter((doc) => {
    const matchSearch =
      search === "" ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.projectTitle.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || doc.type === typeFilter;
    const matchStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const selectClass = cn(
    "h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
    "dark:bg-input/30"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All documents across your projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {Object.entries(DOCUMENT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {Object.entries(DOCUMENT_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={allDocuments.length === 0 ? "No documents yet" : "No results found"}
          description={
            allDocuments.length === 0
              ? "Documents shared by Oren will appear here."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="space-y-0.5">
              <p className="text-xs text-muted-foreground px-1">{doc.projectTitle}</p>
              <DocumentRow document={doc} onDownload={handleDownload} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
