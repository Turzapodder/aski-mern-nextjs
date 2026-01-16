import axios from "axios"
import axiosInstance from "@/lib/axiosInstance"

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
  pagination?: Pagination
}

export interface DashboardStats {
  revenue: {
    total: number
    escrow: number
    available: number
  }
  users: {
    totalStudents: number
    totalTutors: number
    newThisMonth: number
  }
  pending: {
    tutorVerifications: number
    withdrawals: number
    disputes: number
  }
  assignments: {
    active: number
  }
  charts: {
    signups: Array<{ date: string; students: number; tutors: number }>
    revenue: Array<{ month: string; amount: number }>
  }
}

export interface AdminUserSummary {
  id: string
  name: string
  email: string
  roles: string[]
  joinDate: string
  totalSpent: number
  status: string
}

export interface AdminLogEntry {
  _id: string
  actionType: string
  targetId: string
  targetType: string
  timestamp: string
  adminId?: {
    name?: string
    email?: string
  }
}

export interface AdminUserDetails {
  user: Record<string, unknown>
  wallet: Record<string, unknown>
  assignments: Array<Record<string, unknown>>
  recentActivity: AdminLogEntry[]
}

export interface AdminAccount {
  _id: string
  name?: string
  email?: string
  adminRole?: string
  adminPrivileges?: Record<string, unknown>
  lastLogin?: string
  status?: string
}

export interface TransactionRecord {
  _id: string
  userId?: {
    name?: string
    email?: string
    roles?: string[]
  }
  type: string
  amount: number
  status: string
  gatewayId?: string
  createdAt: string
}

export interface FinanceSummary {
  platformRevenue: number
  escrowBalance: number
  payouts: {
    totalAmount: number
    totalCount: number
  }
  pendingWithdrawals: {
    totalAmount: number
    totalCount: number
  }
}

export interface WithdrawalRequest {
  userId: string
  name: string
  email: string
  availableBalance: number
  bankDetails?: Record<string, unknown>
  withdrawal: Record<string, unknown>
}

export interface PlatformSettings {
  _id?: string
  platformFeeRate?: number
  minTransactionFee?: number
  announcement?: {
    message?: string
    expiresAt?: string
    isActive?: boolean
  }
  maintenance?: {
    enabled?: boolean
    scheduledFor?: string
    message?: string
  }
  registration?: {
    disabled?: boolean
    reason?: string
  }
}

export interface QuizQuestion {
  _id: string
  question: string
  category?: string
  difficulty?: string
  options: string[]
  correctIndex: number
  points: number
  isActive: boolean
}

const handleAdminError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      throw error.response.data
    }
    throw { status: "failed", message: error.message }
  }
  throw error
}

const request = async <T>(config: {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  params?: Record<string, unknown>
  data?: unknown
}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
    })
    return response.data
  } catch (error) {
    handleAdminError(error)
    throw error
  }
}

export const adminApi = {
  dashboard: {
    getStats: () => request<DashboardStats>({ url: "/v1/admin/stats", method: "GET" }),
  },
  activity: {
    getRecent: (params?: Record<string, unknown>) =>
      request<AdminLogEntry[]>({
        url: "/v1/admin/activity",
        method: "GET",
        params,
      }),
  },
  users: {
    getAll: (params?: Record<string, unknown>) =>
      request<AdminUserSummary[]>({
        url: "/v1/admin/users",
        method: "GET",
        params,
      }),
    getById: (id: string) =>
      request<AdminUserDetails>({ url: `/v1/admin/users/${id}`, method: "GET" }),
    ban: (id: string, reason?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/users/${id}/ban`,
        method: "POST",
        data: { reason },
      }),
    unban: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/users/${id}/unban`,
        method: "POST",
      }),
  },
  admins: {
    getAll: () =>
      request<AdminAccount[]>({
        url: "/v1/admin/admins",
        method: "GET",
      }),
    add: (payload: { userId?: string; email?: string; role?: string }) =>
      request<AdminAccount>({
        url: "/v1/admin/admins",
        method: "POST",
        data: payload,
      }),
    updateRole: (id: string, role: string) =>
      request<AdminAccount>({
        url: `/v1/admin/admins/${id}`,
        method: "PATCH",
        data: { role },
      }),
    revoke: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/admins/${id}`,
        method: "DELETE",
      }),
  },
  tutors: {
    getPending: () => request<Array<Record<string, unknown>>>({
      url: "/v1/admin/tutors/pending",
      method: "GET",
    }),
    getActive: () => request<Array<Record<string, unknown>>>({
      url: "/v1/admin/tutors/active",
      method: "GET",
    }),
    verify: (id: string, reviewNotes?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/tutors/${id}/verify`,
        method: "POST",
        data: { reviewNotes },
      }),
    reject: (id: string, reason?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/tutors/${id}/reject`,
        method: "POST",
        data: { reason },
      }),
    demote: (id: string, reason?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/tutors/${id}/demote`,
        method: "POST",
        data: { reason },
      }),
  },
  assignments: {
    getAll: (params?: Record<string, unknown>) =>
      request<Array<Record<string, unknown>>>({
        url: "/v1/admin/assignments",
        method: "GET",
        params,
      }),
    getById: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/assignments/${id}`,
        method: "GET",
      }),
    delete: (id: string, reason?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/assignments/${id}/delete`,
        method: "POST",
        data: { reason },
      }),
    forceCancel: (id: string, reason?: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/assignments/${id}/force-cancel`,
        method: "POST",
        data: { reason },
      }),
  },
  finance: {
    getSummary: () =>
      request<FinanceSummary>({
        url: "/v1/admin/finance/summary",
        method: "GET",
      }),
    getTransactions: (params?: Record<string, unknown>) =>
      request<TransactionRecord[]>({
        url: "/v1/admin/transactions",
        method: "GET",
        params,
      }),
    getWithdrawals: (params?: Record<string, unknown>) =>
      request<WithdrawalRequest[]>({
        url: "/v1/admin/withdrawals",
        method: "GET",
        params,
      }),
    processWithdrawal: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/withdrawals/${id}/process`,
        method: "POST",
      }),
  },
  disputes: {
    getAll: () =>
      request<Array<Record<string, unknown>>>({
        url: "/v1/admin/disputes",
        method: "GET",
      }),
    getById: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/disputes/${id}`,
        method: "GET",
      }),
    resolve: (id: string, payload: Record<string, unknown>) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/disputes/${id}/resolve`,
        method: "POST",
        data: payload,
      }),
  },
  settings: {
    get: () =>
      request<PlatformSettings>({
        url: "/v1/admin/settings",
        method: "GET",
      }),
    update: (payload: Partial<PlatformSettings>) =>
      request<PlatformSettings>({
        url: "/v1/admin/settings",
        method: "PUT",
        data: payload,
      }),
  },
  quiz: {
    getQuestions: (params?: Record<string, unknown>) =>
      request<QuizQuestion[]>({
        url: "/v1/admin/quiz/questions",
        method: "GET",
        params,
      }),
    createQuestion: (payload: Partial<QuizQuestion>) =>
      request<QuizQuestion>({
        url: "/v1/admin/quiz/questions",
        method: "POST",
        data: payload,
      }),
    updateQuestion: (id: string, payload: Partial<QuizQuestion>) =>
      request<QuizQuestion>({
        url: `/v1/admin/quiz/questions/${id}`,
        method: "PUT",
        data: payload,
      }),
    deleteQuestion: (id: string) =>
      request<Record<string, unknown>>({
        url: `/v1/admin/quiz/questions/${id}`,
        method: "DELETE",
      }),
    duplicateQuestion: (id: string) =>
      request<QuizQuestion>({
        url: `/v1/admin/quiz/questions/${id}/duplicate`,
        method: "POST",
      }),
  },
}
