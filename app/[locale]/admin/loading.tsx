import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Skeleton, DashboardCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Metric Cards */}
        <DashboardCardSkeleton />

        {/* Table Section */}
        <div className="border-border bg-surface mt-8 overflow-hidden rounded-xl border">
          <div className="border-border border-b p-4">
            <Skeleton className="h-6 w-40" />
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={8} columns={5} />
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
