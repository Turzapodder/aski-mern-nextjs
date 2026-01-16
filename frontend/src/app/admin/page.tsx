"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  FileText,
  RefreshCw,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ValueType } from "recharts/types/component/DefaultTooltipContent"

import { adminApi, AdminLogEntry, DashboardStats } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Trend = {
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

const actionLabels: Record<string, string> = {
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

const formatCurrency = (value: number) =>
  currencyFormatter.format(Number.isFinite(value) ? value : 0)

const formatNumber = (value: number) =>
  numberFormatter.format(Number.isFinite(value) ? value : 0)

const coerceNumber = (value: ValueType | undefined): number => {
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

const formatDateTime = (value?: string) => {
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

const getTrend = (current: number, previous: number): Trend => {
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

const computeSignupTrend = (series: DashboardStats["charts"]["signups"]): Trend => {
  if (series.length < 2) {
    return { direction: "flat", percent: 0 }
  }
  const recent = series.slice(-7)
  const previous = series.slice(-14, -7)
  const recentTotal = recent.reduce((sum, item) => sum + item.students + item.tutors, 0)
  const previousTotal = previous.reduce((sum, item) => sum + item.students + item.tutors, 0)
  return getTrend(recentTotal, previousTotal)
}

const computeRevenueTrend = (series: DashboardStats["charts"]["revenue"]): Trend => {
  if (series.length < 2) {
    return { direction: "flat", percent: 0 }
  }
  const last = series[series.length - 1]?.amount || 0
  const previous = series[series.length - 2]?.amount || 0
  return getTrend(last, previous)
}

const TrendBadge = ({ trend }: { trend: Trend }) => {
  const Icon = trend.direction === "up" ? ArrowUpRight : ArrowDownRight
  const color =
    trend.direction === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend.direction === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-gray-600 bg-gray-100"

  if (trend.direction === "flat") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
        <span>0%</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {trend.percent.toFixed(1)}%
    </span>
  )
}

const AnimatedNumber = ({
  value,
  formatter,
}: {
  value: number
  formatter: (value: number) => string
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const previous = useRef(value)

  useEffect(() => {
    const start = previous.current
    const end = Number.isFinite(value) ? value : 0
    const duration = 700
    const startTime = performance.now()
    let frameId = 0

    const step = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const nextValue = start + (end - start) * progress
      setDisplayValue(nextValue)
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        previous.current = end
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [value])

  return <span>{formatter(displayValue)}</span>
}

export default function AdminDashboardPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Track platform health, revenue flow, and operational backlog in real time.
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          type="button"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary-100/60 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-semibold text-gray-900">
                <AnimatedNumber value={stats?.revenue.total ?? 0} formatter={formatCurrency} />
              </div>
            )}
            <div className="text-xs text-gray-500">
              Escrow: {formatCurrency(stats?.revenue.escrow ?? 0)} | Available: {formatCurrency(stats?.revenue.available ?? 0)}
            </div>
            <TrendBadge trend={revenueTrend} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Users className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-semibold text-gray-900">
                <AnimatedNumber value={totalUsers} formatter={formatNumber} />
              </div>
            )}
            <div className="text-xs text-gray-500">
              Students: {formatNumber(stats?.users.totalStudents ?? 0)} | Tutors: {formatNumber(stats?.users.totalTutors ?? 0)}
            </div>
            <TrendBadge trend={signupTrend} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-100/60 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Tasks</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold text-gray-900">
                <AnimatedNumber value={pendingTotal} formatter={formatNumber} />
              </div>
            )}
            <div className="text-xs text-gray-500">
              Verifications: {formatNumber(stats?.pending.tutorVerifications ?? 0)} | Disputes:{" "}
              {formatNumber(stats?.pending.disputes ?? 0)} | Withdrawals: {formatNumber(stats?.pending.withdrawals ?? 0)}
            </div>
            <TrendBadge trend={defaultTrend} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-100/60 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Assignments</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <FileText className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold text-gray-900">
                <AnimatedNumber value={stats?.assignments.active ?? 0} formatter={formatNumber} />
              </div>
            )}
            <div className="text-xs text-gray-500">Pending, assigned, and submitted assignments</div>
            <TrendBadge trend={defaultTrend} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Signups</CardTitle>
              <p className="text-xs text-gray-500">Student and tutor onboarding over the last 30 days</p>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {statsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                    formatter={(value) => formatNumber(coerceNumber(value))}
                  />
                  <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tutors" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Revenue</CardTitle>
            <p className="text-xs text-gray-500">Platform fees captured over the last 6 months</p>
          </CardHeader>
          <CardContent className="h-72">
            {statsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
                    formatter={(value) => formatCurrency(coerceNumber(value))}
                  />
                  <Bar dataKey="amount" fill="#7c5cff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Recent Admin Activity</CardTitle>
            <p className="text-xs text-gray-500">Latest actions across users, payments, and disputes</p>
          </div>
        </CardHeader>
        <CardContent>
          {(activityLoading || statsLoading) && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!activityLoading && activityError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load admin activity at the moment.
            </div>
          )}

          {!activityLoading && !activityError && activity.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No admin actions recorded yet.
            </div>
          )}

          {!activityLoading && !activityError && activity.length > 0 && (
            <div className="divide-y divide-gray-200">
              {activity.map((entry) => (
                <div key={entry._id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{activityLabel(entry)}</p>
                    <p className="text-xs text-gray-500">
                      {entry.adminId?.name || "Admin"} | {entry.targetType}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">{formatDateTime(entry.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {statsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load dashboard stats. Please refresh or check your admin session.
        </div>
      )}
    </div>
  )
}
