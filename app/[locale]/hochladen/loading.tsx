import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function UploadLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-72" />
        </div>

        {/* Step Navigation Skeleton */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="hidden h-3 w-16 sm:block" />
              {i < 3 && <Skeleton className="h-0.5 w-8" />}
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="border-border bg-surface rounded-xl border p-6">
          <Skeleton className="mb-6 h-6 w-40" />

          <div className="space-y-5">
            {/* Title field */}
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>

            {/* Description field */}
            <div>
              <Skeleton className="mb-2 h-4 w-28" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>

            {/* Subject + Cycle row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>

            {/* File upload area */}
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
