import { useMemo } from "react"
import useSWR from "swr"
import { adminApi } from "@/lib/adminApi"

export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

export const buildMonthSeries = (months: number) => {
  const series: string[] = []
  const today = new Date()
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    series.push(monthKey(date))
  }
  return series
}

export const monthLabel = (key: string) => {
  const [year, month] = key.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

export const useAdminFinanceAnalyticsLogic = () => {
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

  return {
    monthlyRevenue,
    typeBreakdown,
    escrowTrend,
    topTutors,
    isLoading,
    error
  }
}
