/**
 * Shared types for the admin section.
 * Single source of truth — do NOT duplicate in admin page files.
 */

export type AdminTabType =
  | "overview"
  | "users"
  | "documents"
  | "messages"
  | "reports"
  | "transactions"
  | "settings";

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  totalResources?: number;
  pendingApproval: number;
  totalRevenue: number;
  revenueToday: number;
  activeSchools?: number;
  openReports: number;
  newMessages: number;
  userBreakdown?: {
    buyers: number;
    sellers: number;
    schools: number;
  };
  weeklyRevenue?: number[];
}

export interface AdminMaterial {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subjects: string[];
  cycles: string[];
  is_published: boolean;
  is_approved: boolean;
  status: string;
  is_public: boolean;
  file_url: string;
  preview_url: string | null;
  created_at: string;
  updated_at: string;
  seller: {
    id: string;
    display_name: string | null;
    email: string;
  };
  salesCount: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  role: string;
  stripe_charges_enabled: boolean;
  is_protected: boolean;
  is_verified_seller: boolean;
  created_at: string;
  resourceCount: number;
  transactionCount: number;
}

export interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  handled_at: string | null;
  reporter: {
    id: string;
    display_name: string | null;
    email: string;
  };
  resource: {
    id: string;
    title: string;
  } | null;
  reported_user: {
    id: string;
    display_name: string | null;
    email: string;
  } | null;
  handled_by: {
    id: string;
    display_name: string | null;
  } | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
  recipient_count: number;
  sent_at: string | null;
  created_at: string;
}

export interface AdminMaterialsResponse {
  materials: AdminMaterial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: PaginationMeta;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  pagination: PaginationMeta;
}

export interface AdminMessagesResponse {
  messages: ContactMessage[];
  pagination: PaginationMeta;
}
