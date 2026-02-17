"use client";

import { Search } from "lucide-react";
import type { useTranslations } from "next-intl";
import type { CurriculumSearchResult } from "@/lib/curriculum-types";

interface SearchInputProps {
  localSearchQuery: string;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  handleSearchChange: (query: string) => void;
  searchResults: CurriculumSearchResult[];
  onResultSelect: (result: CurriculumSearchResult) => void;
  placeholder: string;
  t: ReturnType<typeof useTranslations>;
}

export function SearchInput({
  localSearchQuery,
  searchFocused,
  setSearchFocused,
  handleSearchChange,
  searchResults,
  onResultSelect,
  placeholder,
  t,
}: SearchInputProps) {
  return (
    <div className="relative mb-5">
      <div className="relative">
        <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={localSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={searchFocused && searchResults.length > 0}
          aria-haspopup="listbox"
          aria-controls="search-results-listbox"
          className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Search Results Dropdown */}
      {searchFocused && searchResults.length > 0 && (
        <div
          id="search-results-listbox"
          role="listbox"
          aria-label={placeholder}
          className="border-border bg-surface absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border shadow-lg"
        >
          <div className="max-h-64 overflow-y-auto p-2">
            {searchResults.map((result) => (
              <button
                role="option"
                aria-selected={false}
                key={result.code}
                onClick={() => onResultSelect(result)}
                className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
              >
                <span
                  className="text-text-on-accent inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold"
                  style={{ backgroundColor: result.fachbereich.color }}
                >
                  {result.fachbereich.shortName.charAt(0)}
                </span>
                <span className="text-primary font-mono text-xs font-medium">{result.code}</span>
                <span className="text-text-secondary flex-1 truncate">{result.name}</span>
                <span className="text-text-muted text-xs">
                  {result.type === "fachbereich"
                    ? t("sidebar.searchResultSubject")
                    : result.type === "kompetenzbereich"
                      ? t("sidebar.searchResultArea")
                      : t("sidebar.searchResultCompetence")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
