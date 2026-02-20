"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: {
    nav: string;
    previous: string;
    next: string;
  };
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  labels,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis for large page counts
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center gap-1" aria-label={labels.nav}>
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="text-text-muted hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          disabled={currentPage === 1}
          aria-label={labels.previous}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((pageNum, idx) =>
          pageNum === "..." ? (
            <span key={`ellipsis-${idx}`} className="text-text-muted px-2 py-2 text-sm">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              className={`min-w-[40px] rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                pageNum === currentPage
                  ? "bg-primary text-text-on-accent shadow-sm"
                  : "text-text-secondary hover:bg-surface hover:scale-[1.02] active:scale-95"
              }`}
              aria-current={pageNum === currentPage ? "page" : undefined}
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="text-text-secondary hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          disabled={currentPage === totalPages}
          aria-label={labels.next}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
