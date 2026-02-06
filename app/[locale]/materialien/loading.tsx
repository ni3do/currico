import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MaterialGridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MaterialienLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="mb-1 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Skeleton - Desktop */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="border-border bg-bg-secondary rounded-xl border p-5">
              <Skeleton className="mb-5 h-6 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="my-5 h-px w-full" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-16 flex-1 rounded-lg" />
                  <Skeleton className="h-16 flex-1 rounded-lg" />
                  <Skeleton className="h-16 flex-1 rounded-lg" />
                </div>
                <Skeleton className="my-5 h-px w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="min-w-0 flex-1">
            {/* Control Bar Skeleton */}
            <div className="bg-bg-secondary mb-6 flex items-center justify-between rounded-lg p-4">
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
            </div>

            <MaterialGridSkeleton count={6} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
