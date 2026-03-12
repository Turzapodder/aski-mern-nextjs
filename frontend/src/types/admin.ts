export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface DashboardStats {
  revenue: {
    total: number;
    escrow: number;
    available: number;
  };
  users: {
    totalStudents: number;
    totalTutors: number;
    newThisMonth: number;
  };
  pending: {
    tutorVerifications: number;
    withdrawals: number;
    disputes: number;
  };
  assignments: {
    active: number;
  };
  charts: {
    signups: Array<{ date: string; students: number; tutors: number }>;
    revenue: Array<{ month: string; amount: number }>;
  };
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  roles: string[];
  joinDate: string;
  totalSpent: number;
  status: string;
}

export interface AdminLogEntry {
  _id: string;
  actionType: string;
  targetId: string;
  targetType: string;
  timestamp: string;
  adminId?: {
    name?: string;
    email?: string;
  };
}

export interface AdminUserDetails {
  user: Record<string, unknown>;
  wallet: Record<string, unknown>;
  assignments: Array<Record<string, unknown>>;
  recentActivity: AdminLogEntry[];
}

export interface AdminAccount {
  _id: string;
  name?: string;
  email?: string;
  adminRole?: string;
  adminPrivileges?: Record<string, unknown>;
  lastLogin?: string;
  status?: string;
}

export interface TransactionRecord {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
    roles?: string[];
  };
  type: string;
  amount: number;
  status: string;
  gatewayId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface FinanceSummary {
  platformRevenue: number;
  escrowBalance: number;
  payouts: {
    totalAmount: number;
    totalCount: number;
  };
  pendingWithdrawals: {
    totalAmount: number;
    totalCount: number;
  };
}

export interface WithdrawalRequest {
  userId: string;
  name: string;
  email: string;
  availableBalance: number;
  bankDetails?: Record<string, unknown>;
  withdrawal: Record<string, unknown>;
}

export interface PlatformSettings {
  _id?: string;
  platformFeeRate?: number;
  minTransactionFee?: number;
  announcement?: {
    message?: string;
    expiresAt?: string;
    isActive?: boolean;
  };
  maintenance?: {
    enabled?: boolean;
    scheduledFor?: string;
    message?: string;
  };
  registration?: {
    disabled?: boolean;
    reason?: string;
  };
}

export interface QuizQuestion {
  _id: string;
  question: string;
  category?: string;
  difficulty?: string;
  options: string[];
  correctIndex: number;
  points: number;
  isActive: boolean;
}

export interface ReportRecord {
  _id: string;
  reporterType: string;
  reportedType: string;
  reason: string;
  comments?: string;
  status: string;
  adminAction?: string;
  createdAt: string;
  reviewedAt?: string;
  reporterId?: {
    name?: string;
    email?: string;
  };
  reportedEntity?: Record<string, unknown> | null;
}
