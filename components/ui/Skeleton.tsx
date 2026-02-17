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

/** Skeleton for profile cards */
export function ProfileCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        {/* Avatar + name */}
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1.5 h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Bio */}
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="mb-4 h-3 w-2/3" />
        {/* Subject pills */}
        <div className="mb-4 flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        {/* Footer stats */}
        <div className="border-border-subtle flex items-center justify-between border-t pt-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Grid of profile card skeletons */
export function ProfileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Compact material card skeleton for dashboard grids (uploads, library, wishlist) */
export function DashboardMaterialCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="px-3 pt-2.5 pb-3">
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="mb-1.5 h-4 w-full" />
        <div className="border-border-subtle mt-3 border-t pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grid of compact dashboard material card skeletons */
export function DashboardMaterialGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DashboardMaterialCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for notification items */
export function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border bg-surface animate-pulse rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for bundle list items */
export function BundleSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for followed seller cards */
export function FollowedSellerSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="card space-y-4 p-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-xl border p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
