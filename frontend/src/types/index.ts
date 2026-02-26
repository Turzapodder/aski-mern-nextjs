// Re-export all shared types from service files
// This provides a single import location for all domain types

export type {
  StudentProfile,
  TutorProfile,
  UserProfile,
  ProfileUpdatePayload,
  UploadFilesResponse,
  ProfileCompletionResponse,
  TutorPublicProfile,
  VerifiedTutorsResponse,
} from "@/lib/services/profile";

// ── Auth / User ──────────────────────────────────────────────────────────────
export type UserRole = "user" | "tutor" | "admin" | "student";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  roles: UserRole[];
  is_verified: boolean;
  onboardingStatus?: string;
  status?: string;
  profileImage?: string;
  wallet?: {
    currency?: string;
    balance?: number;
  };
}

// ── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ── Common API Response ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
}
