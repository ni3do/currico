"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  subject: string | null;
}

interface SearchAutocompleteProps {
  query: string;
  onSelect?: (suggestion: Suggestion) => void;
  /** Whether the input is currently focused */
  isOpen: boolean;
  /** Additional class for positioning */
  className?: string;
  /** Navigate to material on click (default: true) */
  navigateOnSelect?: boolean;
}

const DEBOUNCE_MS = 200;

export function SearchAutocomplete({
  query,
  isOpen,
  onSelect,
  className = "",
  navigateOnSelect = true,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`/api/materials/autocomplete?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isOpen || query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, fetchSuggestions]);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    onSelect?.(suggestion);
    if (navigateOnSelect) {
      router.push(`/materialien/${suggestion.id}`);
    }
    setSuggestions([]);
  };

  const show = isOpen && query.length >= 2 && (suggestions.length > 0 || loading);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`bg-surface border-border-subtle absolute right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border shadow-lg ${className}`}
          role="listbox"
          aria-label={t("autocomplete.label")}
        >
          {loading && suggestions.length === 0 ? (
            <div className="text-text-muted flex items-center gap-2 px-4 py-3 text-sm">
              <Search className="h-4 w-4 animate-pulse" />
              {t("autocomplete.searching")}
            </div>
          ) : (
            <ul className="py-1">
              {suggestions.map((s, i) => (
                <li key={s.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === activeIndex
                        ? "bg-primary/10 text-text"
                        : "text-text hover:bg-surface-hover"
                    }`}
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <FileText className="text-text-muted h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    {s.subject && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getSubjectPillClass(s.subject)}`}
                      >
                        {s.subject}
                      </span>
                    )}
                    {s.price === 0 ? (
                      <span className="text-success shrink-0 text-xs font-medium">
                        {t("autocomplete.free")}
                      </span>
                    ) : (
                      <span className="text-text-muted shrink-0 text-xs">
                        CHF {(s.price / 100).toFixed(2)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {/* "View all results" link */}
              <li className="border-border-subtle border-t">
                <button
                  type="submit"
                  className="text-primary hover:bg-surface-hover flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors"
                >
                  <Search className="h-4 w-4" />
                  {t("autocomplete.viewAll")}
                </button>
              </li>
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Keyboard handler to integrate with the search input.
 * Call this from onKeyDown on the input element.
 */
export function useAutocompleteKeyboard(
  suggestions: Suggestion[],
  activeIndex: number,
  setActiveIndex: (i: number) => void,
  onSelect: (s: Suggestion) => void
) {
  return (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  };
}
