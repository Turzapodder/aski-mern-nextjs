import { useEffect, useMemo, useState } from "react"
import { useGetUserQuery } from "@/lib/services/auth"

export type WithdrawalEntry = {
  _id?: string
  transactionId?: string
  amount?: number
  status?: string
  requestedAt?: string
  completedAt?: string
}

export const formatAmount = (amount: number) => `BDT ${amount.toFixed(2)}`

export const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

export const statusClasses: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700"
}

export const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const weekRatios = [0.35, 0.52, 0.62, 0.4, 0.7, 0.56, 0.45]
export const snapshotRatios = [0.65, 0.38, 0.52, 0.7, 0.45, 0.6, 0.34]

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const getTimeValue = (value?: string) => {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export const useWalletLogic = () => {
  const { data: userData, isLoading, refetch } = useGetUserQuery()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const user = userData?.user
  const isTutor = user?.roles?.includes("tutor")

  const wallet = user?.wallet || {
    availableBalance: 0,
    escrowBalance: 0,
    totalEarnings: 0,
    withdrawalHistory: [],
    bankDetails: {}
  }

  const sortedHistory = useMemo(() => {
    const withdrawalHistory: WithdrawalEntry[] = Array.isArray(
      wallet.withdrawalHistory
    )
      ? wallet.withdrawalHistory
      : []

    return [...withdrawalHistory].sort(
      (a, b) => getTimeValue(b.requestedAt) - getTimeValue(a.requestedAt)
    )
  }, [wallet.withdrawalHistory])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedHistory = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * pageSize
    return sortedHistory.slice(startIndex, startIndex + pageSize)
  }, [currentPage, sortedHistory, totalPages])

  const pendingWithdrawals = useMemo(
    () =>
      sortedHistory
        .filter((entry) => entry?.status === "PENDING")
        .slice(0, 3),
    [sortedHistory]
  )

  const trendBase =
    wallet.totalEarnings || wallet.availableBalance || wallet.escrowBalance || 1
  const trendFactor = clamp(trendBase / 5000, 0.8, 1.2)

  const earningsBars = weekRatios.map((ratio) =>
    clamp(Math.round((22 + ratio * 90) * trendFactor), 20, 120)
  )
  const depositsBars = weekRatios.map((ratio) =>
    clamp(Math.round((14 + ratio * 60) * trendFactor), 14, 95)
  )
  const snapshotBars = snapshotRatios.map((ratio) =>
    clamp(Math.round((18 + ratio * 85) * trendFactor), 18, 110)
  )

  const canWithdraw = wallet.availableBalance > 0

  return {
    userData,
    isLoading,
    refetch,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    user,
    isTutor,
    wallet,
    sortedHistory,
    totalPages,
    pagedHistory,
    pendingWithdrawals,
    earningsBars,
    depositsBars,
    snapshotBars,
    canWithdraw
  }
}
