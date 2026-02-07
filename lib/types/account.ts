// Shared types for the account section

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  type: "purchased" | "free";
  acquiredAt: string;
  previewUrl?: string | null;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
}

export interface UploadedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  status: string;
  isApproved: boolean;
  type: "uploaded";
  createdAt: string;
  downloadCount: number;
  purchaseCount: number;
  previewUrl?: string | null;
}

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  addedAt: string;
  previewUrl?: string | null;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
}

export interface SellerBundle {
  id: string;
  title: string;
  description: string | null;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  status: string;
  isPublished: boolean;
  resourceCount: number;
  savingsPercent: number;
  savingsFormatted: string;
  createdAt: string;
}

export interface UserStats {
  purchasedResources: number;
  downloadedResources: number;
  totalInLibrary: number;
  wishlistItems: number;
  uploadedResources: number;
  followedSellers: number;
}

export interface SellerStats {
  netEarnings: string;
  totalDownloads: number;
  followers: number;
}

export interface SellerMaterial {
  id: string;
  title: string;
  type: string;
  status: string;
  downloads: number;
  netEarnings: string;
}

export interface Transaction {
  id: string;
  resource: string;
  date: string;
  gross: string;
  platformFee: string;
  sellerPayout: string;
}

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  displayName: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  isSeller: boolean;
  bio?: string | null;
  website?: string | null;
  school?: string | null;
  teaching_experience?: string | null;
  preferred_language?: string;
  instagram?: string | null;
  pinterest?: string | null;
  is_private?: boolean;
  notify_new_from_followed?: boolean;
  notify_recommendations?: boolean;
  notify_material_updates?: boolean;
  notify_review_reminders?: boolean;
  notify_wishlist_price_drops?: boolean;
  notify_welcome_offers?: boolean;
  notify_sales?: boolean;
  notify_newsletter?: boolean;
  notify_platform_updates?: boolean;
}

export interface FollowedSeller {
  id: string;
  displayName: string | null;
  image: string | null;
  newResources?: number;
}

export type TabType =
  | "overview"
  | "library"
  | "uploads"
  | "bundles"
  | "comments"
  | "wishlist"
  | "settings-profile"
  | "settings-appearance"
  | "settings-notifications"
  | "settings-account";

// Subject color mapping for pills
export const SUBJECT_PILL_CLASSES: Record<string, string> = {
  Deutsch: "pill-deutsch",
  Mathematik: "pill-mathe",
  NMG: "pill-nmg",
  BG: "pill-gestalten",
  Musik: "pill-musik",
  Sport: "pill-sport",
  Englisch: "pill-fremdsprachen",
  Französisch: "pill-fremdsprachen",
  "Medien und Informatik": "pill-medien",
};

// Cycles are stable, can be hardcoded
export const CYCLES = ["Zyklus 1", "Zyklus 2", "Zyklus 3"];

// Maps tab types to URL paths
export const TAB_TO_PATH: Record<TabType, string> = {
  overview: "/account",
  library: "/account/library",
  uploads: "/account/uploads",
  bundles: "/account/bundles",
  comments: "/account/comments",
  wishlist: "/account/wishlist",
  "settings-profile": "/account/settings",
  "settings-appearance": "/account/settings/appearance",
  "settings-notifications": "/account/settings/notifications",
  "settings-account": "/account/settings/account",
};

// Maps URL paths back to tab types (for sidebar active state)
export function pathToTab(pathname: string): TabType {
  // Remove locale prefix (e.g. /de/account -> /account)
  const path = pathname.replace(/^\/[a-z]{2}/, "");

  if (path === "/account" || path === "/account/") return "overview";
  if (path.startsWith("/account/library")) return "library";
  if (path.startsWith("/account/uploads")) return "uploads";
  if (path.startsWith("/account/bundles")) return "bundles";
  if (path.startsWith("/account/comments")) return "comments";
  if (path.startsWith("/account/wishlist")) return "wishlist";
  if (path.startsWith("/account/settings/appearance")) return "settings-appearance";
  if (path.startsWith("/account/settings/notifications")) return "settings-notifications";
  if (path.startsWith("/account/settings/account")) return "settings-account";
  if (path.startsWith("/account/settings")) return "settings-profile";
  return "overview";
}
