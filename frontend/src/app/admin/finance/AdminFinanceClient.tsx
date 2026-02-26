"use client"

import { Download, FileText, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"
import AdminPagination from "@/components/admin/AdminPagination"
import { statusTone, useAdminFinanceLogic } from "./useAdminFinanceLogic"

export const AdminFinanceClient = () => {
  const {
    type, setType,
    status, setStatus,
    search, setSearch,
    setPage,
    summary,
    summaryLoading,
    summaryError,
    transactionsLoading,
    transactionsError,
    filtered,
    pagination,
    handleExportCsv,
    handleExportPdf
  } = useAdminFinanceLogic();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500">Monitor platform revenue, escrow, and payouts.</p>
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))
        ) : summaryError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Unable to load finance summary.
          </div>
        ) : (
          <>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Platform Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-gray-900">
                {summary?.platformRevenue || 0}
              </CardContent>
            </Card>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Funds in Escrow</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-gray-900">
                {summary?.escrowBalance || 0}
              </CardContent>
            </Card>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Total Payouts</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-gray-900">
                {summary?.payouts.totalAmount || 0}
              </CardContent>
            </Card>
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Pending Withdrawals</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p className="text-2xl font-semibold text-gray-900">{summary?.pendingWithdrawals.totalCount || 0}</p>
                <p className="text-xs text-gray-500">Amount: {summary?.pendingWithdrawals.totalAmount || 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-semibold">Transaction ledger</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by user"
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="escrow_hold">Escrow hold</SelectItem>
                  <SelectItem value="escrow_release">Escrow release</SelectItem>
                  <SelectItem value="platform_fee">Platform fee</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!transactionsLoading && transactionsError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load transactions.
            </div>
          )}

          {!transactionsLoading && !transactionsError && filtered.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No transactions match the current filters.
            </div>
          )}

          {!transactionsLoading && !transactionsError && filtered.length > 0 && (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">User</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Amount</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((transaction: any) => (
                      <tr key={transaction._id} className="hover:bg-gray-50/60">
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {transaction.userId?.name || "N/A"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700 capitalize">
                          {transaction.type.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          ৳{Number.isFinite(transaction.amount) ? transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : transaction.amount}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{transaction.gatewayId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filtered.map((transaction: any) => (
                  <div key={transaction._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{transaction.userId?.name || "N/A"}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusTone(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Type</p>
                        <p className="text-xs font-medium text-gray-700 capitalize">{transaction.type.replace(/_/g, " ")}</p>
                      </div>
                      <div className="space-y-1 text-right min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Amount</p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          ৳{typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : transaction.amount}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-gray-50 pt-3">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Gateway</p>
                        <p className="text-xs text-gray-500 truncate">{transaction.gatewayId || "Internal System"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <AdminPagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
