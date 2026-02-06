import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <Skeleton className="mb-2 h-4 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-64">
            <div className="border-border bg-bg-secondary rounded-xl border p-4">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="min-w-0 flex-1">
            <div className="border-border bg-surface rounded-xl border p-6">
              <Skeleton className="mb-6 h-6 w-48" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-border rounded-lg border p-4">
                    <Skeleton className="mb-2 h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
