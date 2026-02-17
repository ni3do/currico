export interface LP21FilterState {
  showMaterials: boolean;
  showCreators: boolean;
  zyklus: number | null;
  fachbereich: string | null;
  kompetenzbereich: string | null;
  kompetenz: string | null;
  searchQuery: string;
  dialect: string | null;
  maxPrice: number | null;
  formats: string[];
  cantons: string[];
}

export interface MaterialCompetency {
  code: string;
  subjectColor?: string;
}

export interface MaterialListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subjects: string[];
  cycles: string[];
  previewUrl: string | null;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  competencies?: MaterialCompetency[];
  seller: {
    id: string;
    displayName: string | null;
    isVerifiedSeller?: boolean;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfileListItem {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  subjects: string[];
  cycles: string[];
  role: string;
  is_verified_seller?: boolean;
  resourceCount: number;
  followerCount: number;
}
