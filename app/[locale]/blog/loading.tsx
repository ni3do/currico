import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 2xl:max-w-[1440px]">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="mb-2 h-3 w-20" />
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-4 h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
