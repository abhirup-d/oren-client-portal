import { ExternalLink, FileText, MessageSquare, Folder, Globe, Link } from "lucide-react";
import type { AppShortcut } from "@/lib/supabase/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  link: ExternalLink,
  file: FileText,
  message: MessageSquare,
  folder: Folder,
  globe: Globe,
};

interface AppShortcutCardProps {
  shortcut: AppShortcut;
}

export function AppShortcutCard({ shortcut }: AppShortcutCardProps) {
  const Icon = iconMap[shortcut.icon] ?? Link;

  return (
    <a
      href={shortcut.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {shortcut.label}
        </span>
        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
      </div>
    </a>
  );
}
