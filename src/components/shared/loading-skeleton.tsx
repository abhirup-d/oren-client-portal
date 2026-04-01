import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-3 w-1/3 mb-4" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}
