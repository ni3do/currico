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
  tags?: string[];
  createdAt: string;
  downloadCount: number;
  isApproved: boolean;
  isPublished?: boolean;
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
  subjects: string[];
  cycles: string[];
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
  | "downloadCount"
  | "createdAt"
  | "competencies"
  | "seller"
>;

export interface BundleMaterialOption {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subjects: string[];
  cycles: string[];
}

export interface FeaturedMaterial {
  id: string;
  title: string;
  description: string;
  price: number;
  subjects: string[];
  cycles: string[];
  tags?: string[];
  priceFormatted: string;
  previewUrl: string | null;
  averageRating?: number;
  reviewCount?: number;
  downloadCount?: number;
  competencies?: { code: string; subjectColor?: string }[];
  seller: {
    id: string;
    displayName: string | null;
    isVerifiedSeller: boolean;
    sellerLevel?: number;
    sellerXp?: number;
  };
}

export interface BundleResource {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  previewUrl: string | null;
  description: string | null;
}

export interface Bundle {
  id: string;
  title: string;
  description: string | null;
  price: number;
  priceFormatted: string;
  subjects: string[];
  cycles: string[];
  coverImageUrl: string | null;
  createdAt: string;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
    verified: boolean;
    resourceCount: number;
  };
  resources: BundleResource[];
  resourceCount: number;
  totalIndividualPrice: number;
  totalIndividualPriceFormatted: string;
  savings: number;
  savingsFormatted: string;
  savingsPercent: number;
}
