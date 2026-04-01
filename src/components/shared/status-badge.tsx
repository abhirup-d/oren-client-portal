export function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
