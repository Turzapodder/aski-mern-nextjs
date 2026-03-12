// ─── Auth & User Types ───────────────────────────────────────────────────────

export interface AuthResponse {
  status: string;
  message: string;
  data?: any;
}

/** Payload sent to POST /user/register */
export interface RegisterUser {
  email: string;
  password: string;
  name?: string;
  tc?: boolean;
}

export type LoginRole = 'user' | 'tutor' | 'admin';

export interface LoginPayload {
  email: string;
  password: string;
  role: LoginRole;
}

export interface PasswordReset {
  id: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePassword {
  password: string;
  password_confirmation: string;
}

// ─── Profile Types ───────────────────────────────────────────────────────────

export interface StudentProfile {
  institutionName?: string;
  institutionType?: 'College' | 'University' | 'High School' | 'Other';
  department?: string;
  degree?: string;
  yearOfStudy?: string;
  studentID?: string;
  cgpa?: string;
  interests?: string[];
  skills?: string[];
  guardianContact?: string;
  documents?: Array<{
    filename: string;
    originalName: string;
    url: string;
    mimetype: string;
    size: number;
  }>;
}

export interface TutorProfile {
  professionalTitle?: string;
  qualification?: string;
  expertiseSubjects?: string[];
  skills?: string[];
  experienceYears?: number;
  currentInstitution?: string;
  availableDays?: string[];
  availableTimeSlots?: Array<string | { day: string; slots: string[] }>;
  hourlyRate?: number;
  teachingMode?: 'Online' | 'Offline' | 'Hybrid';
  achievements?: string;
  bio?: string;
  documents?: Array<{
    filename: string;
    originalName: string;
    url: string;
    mimetype: string;
    size: number;
  }>;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  about?: string;
  languages?: string[];
  profileImage?: string;
  profileStatus?: boolean;
  roles: string[];
  is_verified: boolean;
  registrationDate: string;
  lastLogin?: string;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
  onboardingStatus?: string;
  status?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  about?: string;
  languages?: string[];
  profileImage?: string;
  profileStatus?: boolean;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
}

export interface UploadFilesResponse {
  status: string;
  message: string;
  files: {
    profileImage?: {
      filename: string;
      originalName: string;
      url: string;
      absoluteUrl: string;
      mimetype: string;
      size: number;
    };
    documents?: Array<{
      filename: string;
      originalName: string;
      url: string;
      absoluteUrl: string;
      mimetype: string;
      size: number;
    }>;
  };
}

export interface ProfileCompletionResponse {
  status: string;
  completion: number;
  profileStatus: boolean;
}

export interface TutorPublicProfile {
  status: string;
  tutor: UserProfile;
}

export interface VerifiedTutorsResponse {
  status: string;
  tutors: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Public Tutor (shared — previously duplicated in 3 files) ────────────────

export interface PublicTutor {
  _id: string;
  name: string;
  profileImage?: string;
  about?: string;
  city?: string;
  country?: string;
  languages?: string[];
  tutorProfile?: TutorProfile;
  publicStats?: {
    averageRating?: number;
    totalReviews?: number;
    totalProjects?: number;
    completedProjects?: number;
    responseTime?: number;
  };
  joinedDate?: string;
}
