/**
 * Shared types for the material detail page and related components.
 * Single source of truth — do NOT duplicate in page files.
 */

export interface Competency {
  id: string;
  code: string;
  description_de: string;
  anforderungsstufe?: string | null;
  subjectCode?: string;
  subjectColor?: string;
}

export interface Transversal {
  id: string;
  code: string;
  name_de: string;
  icon?: string | null;
  color?: string | null;
}

export interface BneTheme {
  id: string;
  code: string;
  name_de: string;
  sdg_number?: number | null;
  icon?: string | null;
  color?: string | null;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  fileUrl: string;
  fileFormat?: string;
  previewUrl: string | null;
  previewUrls?: string[];
  previewCount?: number;
  hasAccess?: boolean;
  subjects: string[];
  cycles: string[];
  subject: string;
  cycle: string;
  createdAt: string;
  downloadCount: number;
  isApproved: boolean;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
    verified: boolean;
    materialCount: number;
  };
  // LP21 curriculum fields
  isMiIntegrated?: boolean;
  competencies?: Competency[];
  transversals?: Transversal[];
  bneThemes?: BneTheme[];
}

export interface RelatedMaterial {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  previewUrl: string | null;
  sellerName: string | null;
}

export type MaterialForPanel = Pick<
  Material,
  | "id"
  | "title"
  | "price"
  | "priceFormatted"
  | "fileFormat"
  | "previewCount"
  | "isApproved"
  | "subjects"
  | "cycles"
  | "subject"
  | "cycle"
  | "downloadCount"
  | "createdAt"
  | "competencies"
  | "seller"
>;
