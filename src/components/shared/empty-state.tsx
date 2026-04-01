import { type LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">{description}</p>
    </div>
  );
}
