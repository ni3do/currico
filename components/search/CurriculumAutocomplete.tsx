"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LP21Badge } from "../curriculum/LP21Badge";

interface SearchResult {
  id: string;
  code: string;
  description_de: string;
  description_fr?: string | null;
  cycle?: number;
  kompetenzbereich?: string | null;
  anforderungsstufe?: string | null;
  subject?: {
    code: string;
    name_de: string;
    color?: string | null;
  };
  type: "competency" | "transversal" | "bne";
}

interface CurriculumAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * CurriculumAutocomplete - Search input with LP21 code recognition
 *
 * Features:
 * - Detects LP21 code patterns (MA.1.A.1, D4A1, etc.)
 * - Shows dropdown with matching competencies
 * - Handles fuzzy formats
 */
export function CurriculumAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Suchen (z.B. MA.1.A oder Addition)...",
  className = "",
}: CurriculumAutocompleteProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Detect if input looks like an LP21 code
  const isLikelyCode = (input: string) => {
    return /^[A-Z]{1,3}[.\s]?\d/i.test(input.trim());
  };

  // Search for competencies
  const searchCompetencies = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, limit: "10" });
      const response = await fetch(`/api/curriculum/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        const allResults: SearchResult[] = [
          ...data.competencies.map((c: SearchResult) => ({
            ...c,
            type: "competency" as const,
          })),
          ...data.transversalCompetencies.map(
            (t: { id: string; code: string; name_de: string; color?: string | null }) => ({
              id: t.id,
              code: t.code,
              description_de: t.name_de,
              type: "transversal" as const,
            })
          ),
          ...data.bneThemes.map(
            (b: { id: string; code: string; name_de: string; color?: string | null }) => ({
              id: b.id,
              code: b.code,
              description_de: b.name_de,
              type: "bne" as const,
            })
          ),
        ];
        setResults(allResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchCompetencies(value);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, searchCompetencies]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onChange(result.code);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect?.(result);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-bg py-3 pr-4 pl-10 text-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        {loading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Code detection hint */}
      {value && isLikelyCode(value) && (
        <div className="mt-1 text-xs text-primary">
          LP21-Code erkannt - Ergebnisse werden nach Code gefiltert
        </div>
      )}

      {/* Results dropdown */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-xl"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                index === selectedIndex
                  ? "bg-primary/10"
                  : "hover:bg-surface-elevated"
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                <LP21Badge
                  code={result.code}
                  subjectColor={result.subject?.color || undefined}
                  size="sm"
                  clickable={false}
                  showTooltip={false}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {result.cycle && (
                    <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs text-text-muted">
                      Zyklus {result.cycle}
                    </span>
                  )}
                  {result.type === "transversal" && (
                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-600 dark:text-purple-400">
                      Überfachlich
                    </span>
                  )}
                  {result.type === "bne" && (
                    <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-600 dark:text-green-400">
                      BNE
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                  {result.description_de}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && value.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-surface p-4 text-center shadow-xl">
          <p className="text-sm text-text-muted">
            Keine Ergebnisse für &quot;{value}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
