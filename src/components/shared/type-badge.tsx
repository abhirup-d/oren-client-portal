export function TypeBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold text-white ${color}`}>
      {label}
    </span>
  );
}
