import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LoginLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="border-border bg-surface w-full max-w-md rounded-2xl border p-8 shadow-sm">
          <div className="mb-8 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-40" />
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1.5 h-4 w-16" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="mx-auto h-4 w-32" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
