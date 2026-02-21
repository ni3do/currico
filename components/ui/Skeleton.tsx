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
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
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
      {" "}
      {/* aria-busy should be placed on the parent <table> or wrapper by the consumer */}
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
    <div className="card overflow-hidden" role="status" aria-busy="true" aria-label="Loading">
      <div className="relative">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        {/* Price badge skeleton */}
        <Skeleton className="absolute top-3 right-3 h-7 w-16 rounded-full" />
      </div>
      <div className="p-4">
        <Skeleton className="mb-1.5 h-3 w-20" />
        <Skeleton className="mb-1.5 h-5 w-3/4" />
        <Skeleton className="mb-1 h-4 w-24" />
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="border-border-subtle mt-3 flex items-center justify-between border-t pt-3">
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
    <div
      className="grid gap-4 min-[1920px]:grid-cols-5 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Loading materials"
    >
      {Array.from({ length: count }).map((_, i) => (
        <MaterialCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for profile cards */
export function ProfileCardSkeleton() {
  return (
    <div className="card overflow-hidden" role="status" aria-busy="true" aria-label="Loading">
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
    <div
      className="grid gap-5 min-[1920px]:grid-cols-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Loading profiles"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Compact material card skeleton for dashboard grids (uploads, library, wishlist) */
export function DashboardMaterialCardSkeleton() {
  return (
    <div
      className="card animate-pulse overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
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
    <div
      className="grid grid-cols-2 gap-4 min-[1920px]:grid-cols-5 sm:gap-5 md:grid-cols-3 2xl:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Loading materials"
    >
      {Array.from({ length: count }).map((_, i) => (
        <DashboardMaterialCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for notification items */
export function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading notifications">
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
    <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading bundles">
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

/** Loading spinner for full-page or inline loading states */
export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-16 w-16 border-4" };
  return (
    <div
      className={`${sizeClasses[size]} border-primary animate-spin rounded-full border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Centered loading spinner with optional wrapper */
export function PageLoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <LoadingSpinner />
    </div>
  );
}

/** Skeleton for the public profile page (/profil/[id]) */
export function ProfilePageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading profile">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Hero skeleton */}
      <div className="from-primary/15 via-accent/8 to-success/15 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Skeleton className="!bg-surface/50 h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="!bg-surface/50 h-8 w-48 rounded-lg" />
              <Skeleton className="!bg-surface/50 h-5 w-24 rounded-full" />
              <Skeleton className="!bg-surface/50 h-4 w-72" />
              <div className="flex gap-2">
                <Skeleton className="!bg-surface/50 h-4 w-28" />
                <Skeleton className="!bg-surface/50 h-4 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border bg-surface animate-pulse rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="!bg-bg-secondary h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="!bg-bg-secondary h-6 w-12" />
                <Skeleton className="!bg-bg-secondary h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Best uploads skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-7 w-36 rounded-lg" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <MaterialCardSkeleton key={i} />
          ))}
        </div>
      </div>
      {/* Tab skeleton */}
      <div className="border-border mb-6 flex gap-4 border-b pb-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <MaterialCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for material detail page (/materialien/[id]) */
export function MaterialDetailSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-busy="true" aria-label="Loading material">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        </div>
        <div className="order-1 lg:order-2">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mb-4 h-9 w-3/4" />
          <div className="border-border mb-4 flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1.5 h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="mb-6 h-4 w-2/3" />
          <div className="border-primary/20 bg-primary/5 rounded-xl border-2 p-6">
            <Skeleton className="mb-4 h-9 w-24" />
            <Skeleton className="mb-4 h-14 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for bundle detail page (/bundles/[id]) */
export function BundleDetailSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-busy="true" aria-label="Loading bundle">
      <Skeleton className="mb-8 h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card rounded-2xl p-8">
            <div className="mb-4 flex gap-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mb-6 h-10 w-3/4" />
            <Skeleton className="mb-4 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-5/6" />
            <Skeleton className="mb-8 h-4 w-2/3" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="card rounded-2xl p-6">
            <Skeleton className="mb-4 h-5 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for review/comment section loading */
export function ReviewSectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={className} role="status" aria-busy="true" aria-label="Loading reviews">
      <div className="border-border bg-bg animate-pulse rounded-xl border p-8">
        <Skeleton className="!bg-surface mb-4 h-6 w-48" />
        <Skeleton className="!bg-surface mb-4 h-4 w-full" />
        <Skeleton className="!bg-surface h-4 w-3/4" />
      </div>
    </div>
  );
}

/** Skeleton for Stripe connect status card */
export function StripeStatusSkeleton() {
  return (
    <div
      className="border-border bg-surface rounded-2xl border p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="!bg-bg h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="!bg-bg h-4 w-32" />
          <Skeleton className="!bg-bg h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for admin chart cards (2-column layout) */
export function AdminChartSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-2"
      role="status"
      aria-busy="true"
      aria-label="Loading charts"
    >
      <div className="border-border bg-surface rounded-xl border p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <div className="border-border bg-surface rounded-xl border p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton for followed seller cards */
export function FollowedSellerSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="card space-y-4 p-8" role="status" aria-busy="true" aria-label="Loading sellers">
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
