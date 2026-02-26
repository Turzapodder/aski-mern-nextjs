"use client"

import { useMemo } from "react"
import useSWR from "swr"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

const buildMonthSeries = (months: number) => {
  const series: string[] = []
  const today = new Date()
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    series.push(monthKey(date))
  }
  return series
}

const monthLabel = (key: string) => {
  const [year, month] = key.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

export default function FinanceAnalyticsPage() {
  const { data, error, isLoading } = useSWR(
    ["admin-finance-analytics"],
    () => adminApi.finance.getTransactions({ page: 1, limit: 200, status: "completed" })
  )

  const transactions = useMemo(() => data?.data ?? [], [data?.data])

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>()
    transactions.forEach((transaction) => {
      if (transaction.type !== "platform_fee") return
      const key = monthKey(new Date(transaction.createdAt))
      map.set(key, (map.get(key) || 0) + transaction.amount)
    })
    const keys = Array.from(map.keys()).sort()
    return keys.map((key) => ({ month: monthLabel(key), amount: map.get(key) || 0 }))
  }, [transactions])

  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    transactions.forEach((transaction) => {
      map.set(transaction.type, (map.get(transaction.type) || 0) + transaction.amount)
    })
    return Array.from(map.entries()).map(([type, amount]) => ({ type, amount }))
  }, [transactions])

  const escrowTrend = useMemo(() => {
    const months = buildMonthSeries(12)
    const escrowDelta = new Map<string, number>()
    const revenueDelta = new Map<string, number>()

    transactions.forEach((transaction) => {
      const key = monthKey(new Date(transaction.createdAt))
      if (transaction.type === "escrow_hold") {
        escrowDelta.set(key, (escrowDelta.get(key) || 0) + transaction.amount)
      }
      if (transaction.type === "escrow_release" || transaction.type === "refund") {
        escrowDelta.set(key, (escrowDelta.get(key) || 0) - transaction.amount)
      }
      if (transaction.type === "platform_fee") {
        revenueDelta.set(key, (revenueDelta.get(key) || 0) + transaction.amount)
      }
    })

    let escrowBalance = 0
    let revenueTotal = 0

    return months.map((key) => {
      escrowBalance = Math.max(0, escrowBalance + (escrowDelta.get(key) || 0))
      revenueTotal = Math.max(0, revenueTotal + (revenueDelta.get(key) || 0))
      return {
        month: monthLabel(key),
        escrow: escrowBalance,
        available: Math.max(0, revenueTotal - escrowBalance),
      }
    })
  }, [transactions])

  const topTutors = useMemo(() => {
    const map = new Map<string, number>()
    transactions.forEach((transaction) => {
      if (transaction.type !== "escrow_release") return
      const name = transaction.userId?.name || "Tutor"
      map.set(name, (map.get(name) || 0) + transaction.amount)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, amount]) => ({ name, amount }))
  }, [transactions])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Revenue analytics</h1>
        <p className="text-sm text-gray-500">Track trends and revenue performance over time.</p>
        <div className="mt-3">
          <AdminSectionNav
            items={[
              { label: "Transactions", href: "/admin/finance" },
              { label: "Withdrawals", href: "/admin/finance/withdrawals" },
              { label: "Analytics", href: "/admin/finance/analytics" },
            ]}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load analytics.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly revenue trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Revenue breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeBreakdown} dataKey="amount" nameKey="type" outerRadius={80} fill="#7c5cff" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Escrow vs available</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={escrowTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="escrow" stackId="1" stroke="#f97316" fill="#fdba74" />
                  <Area type="monotone" dataKey="available" stackId="1" stroke="#16a34a" fill="#86efac" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top earning tutors</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTutors}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
