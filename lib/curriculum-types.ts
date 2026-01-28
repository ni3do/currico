/**
 * Curriculum Type Definitions
 *
 * TypeScript interfaces for Lehrplan 21 curriculum data.
 * Used by both the static data and the API responses.
 */

// ============ Core Types ============

export interface Kompetenz {
  code: string;
  name: string;
  description?: string;
  /** Handlungsaspekte / Themen (Detail) - stored but not displayed in navigation */
  handlungsaspekte?: string[];
}

export interface Kompetenzbereich {
  code: string;
  name: string;
  kompetenzen: Kompetenz[];
  /** Handlungsaspekte / Themen (Detail) - stored but not displayed in navigation */
  handlungsaspekte?: string[];
}

export interface Fachbereich {
  code: string;
  name: string;
  shortName: string;
  color: string;
  colorClass: string;
  icon: string;
  cycles: number[];
  kompetenzbereiche: Kompetenzbereich[];
}

export interface Zyklus {
  id: number;
  name: string;
  shortName: string;
  grades: string[];
  description: string;
}

// ============ API Response Types ============

export interface CurriculumFilterResponse {
  zyklen: Zyklus[];
  fachbereiche: Fachbereich[];
}

export interface CurriculumSubjectResponse {
  id: string;
  code: string;
  name_de: string;
  name_fr: string | null;
  color: string | null;
  icon: string | null;
}

export interface CurriculumCompetencyResponse {
  id: string;
  code: string;
  description_de: string;
  description_fr: string | null;
  cycle: number;
  kompetenzbereich: string | null;
  handlungsaspekt: string | null;
  anforderungsstufe: string | null;
  subject: {
    code: string;
    name_de: string;
    color: string | null;
    icon: string | null;
  };
}

// ============ Search Result Types ============

export interface CurriculumSearchResult {
  type: "fachbereich" | "kompetenzbereich" | "kompetenz";
  code: string;
  name: string;
  fachbereich: Fachbereich;
  kompetenzbereich?: Kompetenzbereich;
  kompetenz?: Kompetenz;
}
