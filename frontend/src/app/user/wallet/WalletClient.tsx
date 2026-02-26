"use client"

import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Clock,
  Sparkles,
  Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import WithdrawModal from "./components/WithdrawModal"
import { 
  useWalletLogic, 
  formatAmount, 
  formatDate, 
  statusClasses, 
  weekLabels 
} from "./useWalletLogic"

export const WalletClient = () => {
  const {
    isLoading,
    refetch,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
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
  } = useWalletLogic();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5fb] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-72 w-full rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-56 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isTutor) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">
        Access Denied
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div
        className="relative overflow-hidden"
      >
        <div className="relative w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-14 2xl:px-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Wallet
              </p>
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl lg:text-4xl">
                Earnings Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Track balances, payouts, and recent activity.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="w-full rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm sm:w-auto">
                Updated just now
              </span>
              <span className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm sm:w-auto">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                Secure payouts
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-[#cfd7ff] via-[#dfe6ff] to-[#f1f4ff] p-5 shadow-[0_24px_50px_-30px_rgba(67,56,202,0.45)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      Invite your friend
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Share the platform and earn rewards on every successful
                      referral.
                    </p>
                  </div>
                  <Button className="w-full rounded-full bg-gray-900 px-6 text-sm text-white hover:bg-black sm:w-auto">
                    Invite friend
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Statistics
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatAmount(wallet.availableBalance)}
                      </p>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        +12.4%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Available today</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    See more
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 flex items-end justify-between gap-2 sm:gap-3">
                  {weekLabels.map((label, index) => (
                    <div
                      key={label}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-24 w-5 flex-col items-center justify-end gap-1 rounded-full bg-[#f4f6fb] p-1 sm:h-28 sm:w-6">
                        <span
                          className="w-full rounded-full bg-[#9edb68]"
                          style={{ height: `${depositsBars[index]}px` }}
                        />
                        <span
                          className="w-full rounded-full bg-[#b9c2ff]"
                          style={{ height: `${earningsBars[index]}px` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#b9c2ff]" />
                    Earnings
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9edb68]" />
                    Deposits
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                    Spendings
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Last transactions
                  </h2>
                  <Button
                    variant="ghost"
                    className="rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    See more
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                {sortedHistory.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    No transactions yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3 sm:hidden">
                      {pagedHistory.map((item) => {
                        const status = item.status || "PENDING"
                        return (
                          <div
                            key={item.transactionId || item._id}
                            className="rounded-2xl border border-gray-100 bg-[#f6f7fb] p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                                  Withdrawal
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  - {formatAmount(Number(item.amount) || 0)}
                                </p>
                              </div>
                              <Badge
                                className={
                                  statusClasses[status] ||
                                  "bg-gray-100 text-gray-700"
                                }
                              >
                                {status}
                              </Badge>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              {formatDate(item.requestedAt)}
                            </div>
                            <p className="mt-2 text-xs text-gray-600">
                              Withdrawal to bank
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="hidden overflow-x-auto sm:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400">
                            <th className="py-2 font-medium">Date</th>
                            <th className="py-2 font-medium">Description</th>
                            <th className="py-2 text-right font-medium">
                              Amount
                            </th>
                            <th className="py-2 text-right font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedHistory.map((item) => {
                            const status = item.status || "PENDING"
                            return (
                              <tr
                                key={item.transactionId || item._id}
                                className="border-b border-gray-100 last:border-0"
                              >
                                <td className="py-3 text-gray-600">
                                  {formatDate(item.requestedAt)}
                                </td>
                                <td className="py-3 text-gray-700">
                                  Withdrawal to bank
                                </td>
                                <td className="py-3 text-right text-gray-900">
                                  - {formatAmount(Number(item.amount) || 0)}
                                </td>
                            <td className="py-3 text-right">
                              <Badge
                                className={
                                  statusClasses[status] ||
                                  "bg-gray-100 text-gray-700"
                                }
                              >
                                {status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-gray-500">
                          Page {Math.min(currentPage, totalPages)} of{" "}
                          {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Available balance
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-gray-500" />
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatAmount(wallet.availableBalance)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Ready for withdrawal
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!canWithdraw}
                            className="w-full rounded-full bg-gray-900 text-white hover:bg-black sm:w-auto"
                          >
                            Withdraw balance
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canWithdraw && (
                        <TooltipContent>No balance available</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="rounded-2xl bg-[#f6f7fb] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                      Escrow balance
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {formatAmount(wallet.escrowBalance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Held for active projects
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                      Total earnings
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {formatAmount(wallet.totalEarnings)}
                    </p>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Withdrawals in progress
                  </h2>
                  <span className="text-xs font-semibold text-gray-400">
                    {pendingWithdrawals.length}
                  </span>
                </div>

                {pendingWithdrawals.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-[#f6f7fb] p-4 text-sm text-gray-500">
                    No pending withdrawals right now.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pendingWithdrawals.map((entry) => (
                      <div
                        key={entry.transactionId || entry._id}
                        className="flex flex-col gap-3 rounded-2xl bg-[#f6f7fb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatAmount(Number(entry.amount) || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested {formatDate(entry.requestedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-4 w-4 text-gray-400" />
                          Pending
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#1b1c21] p-5 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.65)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Earnings snapshot
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">
                      Weekly cashflow
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    className="rounded-full text-xs font-semibold text-white/70 hover:text-white"
                  >
                    See more
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <div className="flex min-w-[280px] items-end justify-between gap-2 sm:min-w-0">
                    {weekLabels.map((label, index) => {
                      const height = snapshotBars[index]
                      const isAccent = index % 2 === 0
                      return (
                        <div
                          key={label}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div className="flex h-24 w-5 flex-col items-center justify-end gap-1 rounded-full bg-white/10 p-1 sm:h-28 sm:w-6">
                            <span
                              className={`w-full rounded-full ${
                                isAccent ? "bg-[#c8ff6d]" : "bg-[#9aa7ff]"
                              }`}
                              style={{ height: `${height}px` }}
                            />
                            <span className="h-3 w-full rounded-full bg-white" />
                          </div>
                          <span className="text-[11px] text-white/50">
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#c8ff6d]" />
                    Incoming
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9aa7ff]" />
                    Settled
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Fees
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WithdrawModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        availableBalance={wallet.availableBalance}
        bankDetails={wallet.bankDetails}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  );
}
