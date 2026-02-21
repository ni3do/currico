import TopBar from "@/components/ui/TopBar";
import { BundleDetailSkeleton } from "@/components/ui/Skeleton";

export default function BundleLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 2xl:max-w-[1440px]">
        <BundleDetailSkeleton />
      </main>
    </div>
  );
}
