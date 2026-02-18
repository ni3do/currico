import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MaterialDetailLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-6 h-4 w-64" />

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column — Gallery + Details */}
          <div className="min-w-0 flex-1">
            {/* Preview Gallery Skeleton */}
            <div className="border-border bg-surface mb-6 overflow-hidden rounded-xl border">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="flex gap-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Title + Meta */}
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="mb-3 h-8 w-3/4" />
            <Skeleton className="mb-6 h-4 w-full" />
            <Skeleton className="mb-6 h-4 w-2/3" />

            {/* Description Skeleton */}
            <div className="border-border bg-surface mb-6 rounded-xl border p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Reviews Skeleton */}
            <div className="border-border bg-surface rounded-xl border p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border-border border-b pb-4">
                    <div className="mb-2 flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Purchase Panel */}
          <div className="w-full lg:w-80">
            <div className="border-border bg-surface sticky top-24 rounded-xl border p-6">
              <Skeleton className="mb-4 h-10 w-32" />
              <Skeleton className="mb-6 h-12 w-full rounded-full" />
              <div className="border-border space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {/* Seller Info Skeleton */}
              <div className="border-border mt-6 border-t pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="mb-1 h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
