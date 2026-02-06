/**
 * Reusable skeleton loading components for consistent loading states.
 */

/** Basic rectangular skeleton block */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-border/50 animate-pulse rounded ${className}`} />;
}

/** Skeleton for admin metric cards (4-grid layout) */
export function DashboardCardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-border bg-surface rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a table with configurable columns and rows */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-border border-b">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <Skeleton className={`h-4 ${colIdx === 0 ? "w-32" : "w-20"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Skeleton for material cards in a grid */
export function MaterialCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-5">
        <Skeleton className="mb-3 h-3 w-20" />
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-4 h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="border-border-subtle mt-4 flex items-center justify-between border-t pt-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Grid of material card skeletons */
export function MaterialGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MaterialCardSkeleton key={i} />
      ))}
    </div>
  );
}
