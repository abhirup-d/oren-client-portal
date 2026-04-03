"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ENGAGEMENT_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectOption {
  id: string;
  title: string;
}

export function DocumentActions({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"engagement" | "project">(
    "engagement"
  );
  const [engagementType, setEngagementType] = useState("purchase_order");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [docType, setDocType] = useState("deliverable");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const selectClass = cn(
    "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
    "dark:bg-input/30"
  );

  function resetForm() {
    setCategory("engagement");
    setEngagementType("purchase_order");
    setProjectId(projects[0]?.id ?? "");
    setDocType("deliverable");
    setTitle("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("type", docType);
    if (title.trim()) formData.append("title", title.trim());

    if (category === "engagement") {
      formData.append("engagement_type", engagementType);
    } else {
      formData.append("project_id", projectId);
    }

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Upload failed");
      }

      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Upload className="h-4 w-4" data-icon="inline-start" />
            Upload Document
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to your engagement or a specific project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category toggle */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory("engagement")}
                className={cn(
                  "flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  category === "engagement"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Engagement
              </button>
              <button
                type="button"
                onClick={() => setCategory("project")}
                className={cn(
                  "flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  category === "project"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Project
              </button>
            </div>
          </div>

          {/* Engagement type or Project selector */}
          {category === "engagement" ? (
            <div className="space-y-1.5">
              <Label htmlFor="engagement_type">Engagement Type</Label>
              <select
                id="engagement_type"
                value={engagementType}
                onChange={(e) => setEngagementType(e.target.value)}
                className={selectClass}
              >
                {Object.entries(ENGAGEMENT_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="project_id">Project</Label>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No projects available.
                </p>
              ) : (
                <select
                  id="project_id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={selectClass}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Document type */}
          <div className="space-y-1.5">
            <Label htmlFor="doc_type">Document Type</Label>
            <select
              id="doc_type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className={selectClass}
            >
              {Object.entries(DOCUMENT_TYPES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="doc_title">
              Title{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="doc_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          {/* File input */}
          <div className="space-y-1.5">
            <Label htmlFor="doc_file">File</Label>
            <Input id="doc_file" type="file" ref={fileRef} />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={uploading || (category === "project" && projects.length === 0)}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" data-icon="inline-start" />
                Upload
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Download button (client component) ───────────────────────────────

export function DownloadButton({
  filePath,
  title,
}: {
  filePath: string;
  title: string;
}) {
  const supabase = createClient();

  const handleDownload = useCallback(async () => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }, [supabase, filePath]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      title={`Download ${title}`}
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Download className="h-4 w-4" />
    </button>
  );
}
