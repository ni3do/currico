import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton, MaterialGridSkeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-6 h-4 w-48" />

        {/* Profile Hero Skeleton */}
        <div className="border-border bg-surface mb-8 rounded-xl border p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 text-center sm:text-left">
              <Skeleton className="mx-auto mb-2 h-7 w-48 sm:mx-0" />
              <Skeleton className="mx-auto mb-3 h-4 w-32 sm:mx-0" />
              <Skeleton className="mx-auto mb-4 h-4 w-80 sm:mx-0" />
              <div className="flex justify-center gap-2 sm:justify-start">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-border bg-surface rounded-xl border p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-8 w-12" />
              <Skeleton className="mx-auto h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Material Grid Skeleton */}
        <MaterialGridSkeleton count={6} />
      </main>

      <Footer />
    </div>
  );
}
