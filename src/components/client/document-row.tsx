import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants";
import { formatFileSize, formatDate } from "@/lib/utils";
import type { Document } from "@/lib/supabase/types";

interface DocumentRowProps {
  document: Document;
  onDownload: (document: Document) => void;
}

export function DocumentRow({ document, onDownload }: DocumentRowProps) {
  const statusConfig = DOCUMENT_STATUSES[document.status];
  const typeConfig = DOCUMENT_TYPES[document.type];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{document.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {typeConfig.label} &middot; v{document.version} &middot;{" "}
          {formatFileSize(document.file_size)} &middot;{" "}
          {formatDate(document.created_at)}
        </p>
      </div>

      <div className="flex-shrink-0">
        <StatusBadge label={statusConfig.label} color={statusConfig.color} />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDownload(document)}
        title="Download"
        className="flex-shrink-0"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
