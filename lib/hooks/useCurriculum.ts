"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Fachbereich,
  Zyklus,
  CurriculumFilterResponse,
  CurriculumSearchResult,
} from "@/lib/curriculum-types";

interface UseCurriculumOptions {
  cycle?: number;
}

interface UseCurriculumReturn {
  fachbereiche: Fachbereich[];
  zyklen: Zyklus[];
  loading: boolean;
  error: Error | null;
  getFachbereicheByZyklus: (zyklusId: number) => Fachbereich[];
  getFachbereichByCode: (code: string) => Fachbereich | undefined;
  searchByCode: (query: string) => CurriculumSearchResult[];
}

// Simple in-memory cache for curriculum data
let cachedData: CurriculumFilterResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCurriculum(options?: UseCurriculumOptions): UseCurriculumReturn {
  const [fachbereiche, setFachbereiche] = useState<Fachbereich[]>([]);
  const [zyklen, setZyklen] = useState<Zyklus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetch in strict mode
    if (fetchedRef.current) return;

    async function fetchCurriculum() {
      // Check cache first
      const now = Date.now();
      if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
        setFachbereiche(cachedData.fachbereiche);
        setZyklen(cachedData.zyklen);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({ format: "filter" });
        if (options?.cycle) {
          params.set("cycle", options.cycle.toString());
        }

        const response = await fetch(`/api/curriculum?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch curriculum: ${response.statusText}`);
        }

        const data: CurriculumFilterResponse = await response.json();

        // Update cache
        cachedData = data;
        cacheTimestamp = Date.now();

        setFachbereiche(data.fachbereiche);
        setZyklen(data.zyklen);
        setError(null);
      } catch (err) {
        console.error("Error fetching curriculum from API:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch curriculum"));
      } finally {
        setLoading(false);
      }
    }

    fetchedRef.current = true;
    fetchCurriculum();
  }, [options?.cycle]);

  const getFachbereicheByZyklus = useCallback(
    (zyklusId: number): Fachbereich[] => {
      return fachbereiche.filter((f) => f.cycles.includes(zyklusId));
    },
    [fachbereiche]
  );

  const getFachbereichByCode = useCallback(
    (code: string): Fachbereich | undefined => {
      return fachbereiche.find((f) => f.code === code);
    },
    [fachbereiche]
  );

  const searchByCode = useCallback(
    (query: string): CurriculumSearchResult[] => {
      const results: CurriculumSearchResult[] = [];
      const normalizedQuery = query.toUpperCase().trim();

      if (!normalizedQuery || normalizedQuery.length < 2) {
        return results;
      }

      for (const fachbereich of fachbereiche) {
        // Check Fachbereich
        if (fachbereich.code.toUpperCase().includes(normalizedQuery)) {
          results.push({
            type: "fachbereich",
            code: fachbereich.code,
            name: fachbereich.name,
            fachbereich,
          });
        }

        for (const kompetenzbereich of fachbereich.kompetenzbereiche) {
          // Check Kompetenzbereich
          if (kompetenzbereich.code.toUpperCase().includes(normalizedQuery)) {
            results.push({
              type: "kompetenzbereich",
              code: kompetenzbereich.code,
              name: kompetenzbereich.name,
              fachbereich,
              kompetenzbereich,
            });
          }

          for (const kompetenz of kompetenzbereich.kompetenzen) {
            // Check Kompetenz
            if (kompetenz.code.toUpperCase().includes(normalizedQuery)) {
              results.push({
                type: "kompetenz",
                code: kompetenz.code,
                name: kompetenz.name,
                fachbereich,
                kompetenzbereich,
                kompetenz,
              });
            }
          }
        }
      }

      return results;
    },
    [fachbereiche]
  );

  return {
    fachbereiche,
    zyklen,
    loading,
    error,
    getFachbereicheByZyklus,
    getFachbereichByCode,
    searchByCode,
  };
}

export default useCurriculum;
