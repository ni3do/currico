import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CollectionsLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Collection Cards Grid */}
        <div
          className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          role="status"
          aria-busy="true"
          aria-label="Loading"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border bg-bg rounded-xl border p-5">
              <div className="mb-3 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-2/3" />
              <div className="border-border flex items-center justify-between border-t pt-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
