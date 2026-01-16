"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Download, FileText, Search } from "lucide-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"

const statusTone = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "failed":
      return "bg-rose-100 text-rose-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export default function AdminFinancePage() {
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      type,
      status,
    }),
    [page, status, type]
  )

  const {
    data: summaryResponse,
    error: summaryError,
    isLoading: summaryLoading,
  } = useSWR("admin-finance-summary", () => adminApi.finance.getSummary())

  const {
    data: transactionsResponse,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useSWR(["admin-transactions", params], () => adminApi.finance.getTransactions(params))

  const transactions = useMemo(() => transactionsResponse?.data ?? [], [transactionsResponse?.data])
  const pagination = transactionsResponse?.pagination

  const filtered = useMemo(() => {
    if (!search) return transactions
    return transactions.filter((transaction) =>
      String(transaction.userId?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [search, transactions])

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No transactions to export")
      return
    }
    const rows = [
      ["Date", "User", "Type", "Amount", "Status", "Gateway ID"],
      ...filtered.map((transaction) => [
        new Date(transaction.createdAt).toLocaleString(),
        transaction.userId?.name || "N/A",
        transaction.type,
        transaction.amount,
        transaction.status,
        transaction.gatewayId || "",
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `transactions-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    if (filtered.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const doc = new jsPDF()
    const margin = 14
    const lineHeight = 5
    let y = 16
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2

    doc.setFontSize(14)
    doc.text("Aski Finance Report", margin, y)
    y += lineHeight + 2
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
    y += lineHeight + 2

    const header = "Date | User | Type | Amount | Status | Gateway"
    doc.setFontSize(9)
    doc.text(header, margin, y)
    y += lineHeight
    doc.line(margin, y, pageWidth - margin, y)
    y += lineHeight

    filtered.forEach((transaction) => {
      const line = [
        new Date(transaction.createdAt).toLocaleDateString(),
        transaction.userId?.name || "N/A",
        transaction.type,
        String(transaction.amount),
        transaction.status,
        transaction.gatewayId || "-",
      ].join(" | ")

      const lines = doc.splitTextToSize(line, maxWidth)
      if (y + lines.length * lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(lines, margin, y)
      y += lines.length * lineHeight
    })

    doc.save(`finance-report-${Date.now()}.pdf`)
  }

  const summary = summaryResponse?.data

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
            <div className="overflow-x-auto">
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
                  {filtered.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{transaction.userId?.name || "N/A"}</td>
                      <td className="py-3 pr-4 text-gray-700">{transaction.type}</td>
                      <td className="py-3 pr-4 text-gray-700">{transaction.amount}</td>
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
          )}

          {!transactionsLoading && pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
