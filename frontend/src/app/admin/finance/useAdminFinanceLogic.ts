import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

import { adminApi } from "@/lib/adminApi"

export const statusTone = (status?: string) => {
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

export const useAdminFinanceLogic = () => {
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

  return {
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
  }
}
