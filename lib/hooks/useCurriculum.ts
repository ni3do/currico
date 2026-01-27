"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Fachbereich,
  Zyklus,
  CurriculumFilterResponse,
  CurriculumSearchResult,
} from "@/lib/curriculum-types";

// Static ZYKLEN data - these don't change and don't need to be in DB
export const ZYKLEN: Zyklus[] = [
  {
    id: 1,
    name: "Zyklus 1",
    shortName: "Z1",
    grades: ["KG", "1", "2"],
    description: "Kindergarten – 2. Klasse",
  },
  {
    id: 2,
    name: "Zyklus 2",
    shortName: "Z2",
    grades: ["3", "4", "5", "6"],
    description: "3. – 6. Klasse",
  },
  {
    id: 3,
    name: "Zyklus 3",
    shortName: "Z3",
    grades: ["7", "8", "9"],
    description: "7. – 9. Klasse",
  },
];

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
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        console.error("Error fetching curriculum:", err);
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
    zyklen: ZYKLEN,
    loading,
    error,
    getFachbereicheByZyklus,
    getFachbereichByCode,
    searchByCode,
  };
}

export default useCurriculum;
