import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { adminApi, AdminLogEntry, DashboardStats } from "@/lib/adminApi"
import type { ValueType } from "recharts/types/component/DefaultTooltipContent"

export type Trend = {
  direction: "up" | "down" | "flat"
  percent: number
}

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
})

export const actionLabels: Record<string, string> = {
  BAN_USER: "Banned user",
  UNBAN_USER: "Unbanned user",
  APPROVE_TUTOR: "Approved tutor",
  REJECT_TUTOR: "Rejected tutor",
  DEMOTE_TUTOR: "Demoted tutor",
  DELETE_ASSIGNMENT: "Deleted assignment",
  FORCE_CANCEL_ASSIGNMENT: "Force-cancelled assignment",
  PROCESS_WITHDRAWAL: "Processed withdrawal",
  RESOLVE_DISPUTE_REFUND: "Resolved dispute (refund)",
  RESOLVE_DISPUTE_RELEASE: "Resolved dispute (release)",
  RESOLVE_DISPUTE_SPLIT: "Resolved dispute (split)",
  UPDATE_SETTINGS: "Updated settings",
  CREATE_QUIZ_QUESTION: "Created quiz question",
  UPDATE_QUIZ_QUESTION: "Updated quiz question",
  DELETE_QUIZ_QUESTION: "Deleted quiz question",
  DUPLICATE_QUIZ_QUESTION: "Duplicated quiz question",
  PROMOTE_ADMIN: "Granted admin access",
  UPDATE_ADMIN_ROLE: "Updated admin role",
  REVOKE_ADMIN: "Revoked admin access",
}

export const formatCurrency = (value: number) =>
  currencyFormatter.format(Number.isFinite(value) ? value : 0)

export const formatNumber = (value: number) =>
  numberFormatter.format(Number.isFinite(value) ? value : 0)

export const coerceNumber = (value: ValueType | undefined): number => {
  if (Array.isArray(value)) {
    return coerceNumber(value[0])
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export const formatDateTime = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getTrend = (current: number, previous: number): Trend => {
  if (!Number.isFinite(previous) || previous === 0) {
    return {
      direction: current === 0 ? "flat" : "up",
      percent: current === 0 ? 0 : 100,
    }
  }

  const change = ((current - previous) / previous) * 100
  if (change > 0.5) {
    return { direction: "up", percent: Math.abs(change) }
  }
  if (change < -0.5) {
    return { direction: "down", percent: Math.abs(change) }
  }
  return { direction: "flat", percent: Math.abs(change) }
}

export const computeSignupTrend = (series: DashboardStats["charts"]["signups"]): Trend => {
  if (series.length < 2) {
    return { direction: "flat", percent: 0 }
  }
  const recent = series.slice(-7)
  const previous = series.slice(-14, -7)
  const recentTotal = recent.reduce((sum, item) => sum + item.students + item.tutors, 0)
  const previousTotal = previous.reduce((sum, item) => sum + item.students + item.tutors, 0)
  return getTrend(recentTotal, previousTotal)
}

export const computeRevenueTrend = (series: DashboardStats["charts"]["revenue"]): Trend => {
  if (series.length < 2) {
    return { direction: "flat", percent: 0 }
  }
  const last = series[series.length - 1]?.amount || 0
  const previous = series[series.length - 2]?.amount || 0
  return getTrend(last, previous)
}

export const useAdminDashboardLogic = () => {
  const {
    data: statsResponse,
    error: statsError,
    isLoading: statsLoading,
    isValidating: statsValidating,
    mutate: refreshStats,
  } = useSWR("admin-dashboard-stats", adminApi.dashboard.getStats, {
    refreshInterval: 300000,
  })

  const {
    data: activityResponse,
    error: activityError,
    isLoading: activityLoading,
    isValidating: activityValidating,
    mutate: refreshActivity,
  } = useSWR(
    "admin-dashboard-activity",
    () => adminApi.activity.getRecent({ limit: 10 }),
    { refreshInterval: 300000 }
  )

  const stats = statsResponse?.data
  const activity = activityResponse?.data ?? []

  const pendingTotal = stats
    ? stats.pending.tutorVerifications + stats.pending.withdrawals + stats.pending.disputes
    : 0

  const totalUsers = stats ? stats.users.totalStudents + stats.users.totalTutors : 0

  const defaultTrend: Trend = { direction: "flat", percent: 0 }
  const revenueTrend = stats ? computeRevenueTrend(stats.charts.revenue) : defaultTrend
  const signupTrend = stats ? computeSignupTrend(stats.charts.signups) : defaultTrend

  const refreshAll = useCallback(() => {
    refreshStats()
    refreshActivity()
  }, [refreshActivity, refreshStats])

  const isRefreshing = statsValidating || activityValidating

  const activityLabel = (entry: AdminLogEntry) => {
    if (actionLabels[entry.actionType]) {
      return actionLabels[entry.actionType]
    }
    return entry.actionType.replace(/_/g, " ").toLowerCase()
  }

  const revenueData = stats?.charts.revenue ?? []
  const signupData = stats?.charts.signups ?? []

  return {
    statsLoading,
    statsError,
    activityLoading,
    activityError,
    isRefreshing,
    refreshAll,
    stats,
    activity,
    pendingTotal,
    totalUsers,
    revenueTrend,
    signupTrend,
    defaultTrend,
    revenueData,
    signupData,
    activityLabel
  }
}
