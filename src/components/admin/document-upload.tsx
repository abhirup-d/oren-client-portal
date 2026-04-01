"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPES } from "@/lib/constants";

interface DocumentUploadProps {
  projectId: string;
  orgId: string;
  adminUserId: string;
  onUploaded: () => void;
}

type DocumentType = "deliverable" | "working_doc";

export function DocumentUpload({
  projectId,
  orgId,
  adminUserId,
  onUploaded,
}: DocumentUploadProps) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("deliverable");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const filePath = `${orgId}/${projectId}/${timestamp}-${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (storageError) throw storageError;

      const documentTitle = title.trim() || file.name;

      const { error: insertError } = await supabase.from("documents").insert({
        project_id: projectId,
        title: documentTitle,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
        type: docType,
        status: "draft",
        uploaded_by: adminUserId,
        uploaded_by_type: "admin",
      });

      if (insertError) throw insertError;

      // Log activity
      await supabase.from("activity_log").insert({
        org_id: orgId,
        project_id: projectId,
        actor_id: adminUserId,
        actor_type: "admin",
        action: "document_uploaded",
        details: { title: documentTitle, type: docType },
      });

      setTitle("");
      setDocType("deliverable");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-border bg-muted/30 p-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-foreground">Upload Document</h3>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Leave blank to use filename"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(DOCUMENT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            File <span className="text-destructive">*</span>
          </label>
          <input
            type="file"
            ref={fileRef}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
