"use client";

import { LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultsControlBarProps {
  isLoading: boolean;
  totalCount: number;
  countLabel: string;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showMaterials: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  profileSortBy: string;
  onProfileSortChange: (sort: string) => void;
  labels: {
    sortLabel: string;
    gridView: string;
    listView: string;
    sortNewest: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    profileSortNewest: string;
    profileSortMostMaterials: string;
    profileSortMostFollowers: string;
  };
}

export function ResultsControlBar({
  isLoading,
  totalCount,
  countLabel,
  viewMode,
  onViewModeChange,
  showMaterials,
  sortBy,
  onSortChange,
  profileSortBy,
  onProfileSortChange,
  labels,
}: ResultsControlBarProps) {
  return (
    <div className="bg-bg-secondary mb-4 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Results Count */}
      <div className="h-5">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-surface h-5 w-40 animate-pulse rounded"
            />
          ) : (
            <motion.p
              key={`count-${totalCount}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-text-muted text-sm tabular-nums"
            >
              <span className="text-text font-semibold">{totalCount}</span> {countLabel}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* View Toggle + Sort Dropdown */}
      <div className="flex items-center gap-3">
        {/* Grid/List Toggle -- materials only */}
        {showMaterials && (
          <div className="bg-surface flex rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`rounded-md p-2 transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-primary text-text-on-accent shadow-sm"
                  : "text-text-faint hover:text-text-muted active:scale-90"
              }`}
              aria-label={labels.gridView}
              title={labels.gridView}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`rounded-md p-2 transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-primary text-text-on-accent shadow-sm"
                  : "text-text-faint hover:text-text-muted active:scale-90"
              }`}
              aria-label={labels.listView}
              title={labels.listView}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-text-muted hidden text-sm whitespace-nowrap sm:inline">
            {labels.sortLabel}
          </label>
          {showMaterials ? (
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-full border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="newest">{labels.sortNewest}</option>
              <option value="price-low">{labels.sortPriceLow}</option>
              <option value="price-high">{labels.sortPriceHigh}</option>
            </select>
          ) : (
            <select
              value={profileSortBy}
              onChange={(e) => onProfileSortChange(e.target.value)}
              className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-full border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="newest">{labels.profileSortNewest}</option>
              <option value="mostMaterials">{labels.profileSortMostMaterials}</option>
              <option value="mostFollowers">{labels.profileSortMostFollowers}</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
