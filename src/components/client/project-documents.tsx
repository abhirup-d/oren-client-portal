"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document } from "@/lib/supabase/types";

/** Engagement types that map to each slot for DB lookups. */
const SLOT_ENGAGEMENT_TYPES: Record<SlotKey, Document["engagement_type"][]> = {
  proposal_sow: ["proposal", "scope_of_work"],
  purchase_order: ["purchase_order"],
  any_other: ["other", "nda", "msa"],
};

const SLOTS = [
  {
    key: "proposal_sow" as const,
    title: "Proposal / SoW",
    descriptionAdmin: "Upload signed Proposals and Statements of Work.",
    descriptionClient: "Proposals and Statements of Work uploaded by Oren.",
  },
  {
    key: "purchase_order" as const,
    title: "Purchase Order",
    descriptionAdmin: "Upload Purchase Orders associated with this project.",
    descriptionClient: "Purchase Orders uploaded by Oren.",
  },
  {
    key: "any_other" as const,
    title: "Any Other Documents",
    descriptionAdmin: "Upload any other supporting project documents.",
    descriptionClient: "Upload any other supporting project documents.",
  },
];

type SlotKey = "proposal_sow" | "purchase_order" | "any_other";
type StagedFile = { id: string; name: string; size: number };
type Staged = Record<SlotKey, StagedFile[]>;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ProjectDocumentsProps {
  /** "admin" = all slots uploadable, "client" = first 2 read-only, third uploadable. */
  mode?: "admin" | "client";
  /** Existing documents from DB (used in client mode to display admin-uploaded files). */
  documents?: Document[];
}

export function ProjectDocuments({
  mode = "admin",
  documents = [],
}: ProjectDocumentsProps) {
  const [staged, setStaged] = useState<Staged>({
    proposal_sow: [],
    purchase_order: [],
    any_other: [],
  });
  const [dragOver, setDragOver] = useState<SlotKey | null>(null);

  function addFiles(slot: SlotKey, files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setStaged((prev) => ({
      ...prev,
      [slot]: [
        ...prev[slot],
        ...list.map((f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`,
          name: f.name,
          size: f.size,
        })),
      ],
    }));
  }

  function removeFile(slot: SlotKey, id: string) {
    setStaged((prev) => ({
      ...prev,
      [slot]: prev[slot].filter((f) => f.id !== id),
    }));
  }

  /** Get existing DB documents for a given slot key. */
  function getDocsForSlot(key: SlotKey): Document[] {
    const types = SLOT_ENGAGEMENT_TYPES[key];
    return documents.filter(
      (d) => d.engagement_type && types.includes(d.engagement_type)
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-4">
        Project Documents
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SLOTS.map((slot) => {
          const isReadOnly =
            mode === "client" && slot.key !== "any_other";
          const description =
            mode === "client" ? slot.descriptionClient : slot.descriptionAdmin;
          const existingDocs = getDocsForSlot(slot.key);

          if (isReadOnly) {
            return (
              <ReadOnlySlot
                key={slot.key}
                title={slot.title}
                description={description}
                documents={existingDocs}
              />
            );
          }

          return (
            <UploadSlot
              key={slot.key}
              title={slot.title}
              description={description}
              files={staged[slot.key]}
              isDragOver={dragOver === slot.key}
              onDragEnter={() => setDragOver(slot.key)}
              onDragLeave={() =>
                setDragOver((cur) => (cur === slot.key ? null : cur))
              }
              onDrop={(files) => {
                setDragOver(null);
                addFiles(slot.key, files);
              }}
              onSelect={(files) => addFiles(slot.key, files)}
              onRemove={(id) => removeFile(slot.key, id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Read-only slot (client view for Proposal/SoW and Purchase Order)          */
/* -------------------------------------------------------------------------- */

interface ReadOnlySlotProps {
  title: string;
  description: string;
  documents: Document[];
}

function ReadOnlySlot({ title, description, documents }: ReadOnlySlotProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background/50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center">
          <FileText className="h-5 w-5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">
            No documents uploaded yet
          </span>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground" title={doc.title}>
                  {doc.title}
                </span>
              </div>
              <span className="flex-shrink-0 text-muted-foreground">
                {formatSize(doc.file_size)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Upload slot (admin: all slots, client: "Any Other Documents" only)        */
/* -------------------------------------------------------------------------- */

interface UploadSlotProps {
  title: string;
  description: string;
  files: StagedFile[];
  isDragOver: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (files: FileList) => void;
  onSelect: (files: FileList) => void;
  onRemove: (id: string) => void;
}

function UploadSlot({
  title,
  description,
  files,
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onSelect,
  onRemove,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background/50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          onDragEnter();
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          onDragLeave();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            onDrop(e.dataTransfer.files);
          }
        }}
        className={cn(
          "group flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
        <span className="text-xs font-medium text-foreground">
          Drop files or click to upload
        </span>
        <span className="text-[11px] text-muted-foreground">
          Multiple files supported
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onSelect(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground" title={f.name}>
                  {f.name}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <span className="text-muted-foreground">
                  {formatSize(f.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(f.id)}
                  title="Remove"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
