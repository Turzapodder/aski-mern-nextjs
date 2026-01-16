"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"

type WithdrawalRow = Record<string, any>

export default function AdminWithdrawalsPage() {
  const { data, error, isLoading, mutate } = useSWR("admin-withdrawals", () =>
    adminApi.finance.getWithdrawals()
  )
  const { data: processedResponse } = useSWR("admin-withdrawals-processed", () =>
    adminApi.finance.getTransactions({ type: "withdrawal", status: "completed", page: 1, limit: 10 })
  )

  const withdrawals = useMemo(() => data?.data ?? [], [data])
  const processed = useMemo(() => processedResponse?.data ?? [], [processedResponse])
  const [selected, setSelected] = useState<WithdrawalRow | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openConfirm = (row: WithdrawalRow) => {
    setSelected(row)
    setChecked(false)
    setConfirmOpen(true)
  }

  const handleProcess = async () => {
    if (!selected?.withdrawal?.transactionId) return
    setIsSubmitting(true)
    try {
      await adminApi.finance.processWithdrawal(selected.withdrawal.transactionId)
      toast.success("Withdrawal processed")
      setConfirmOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to process withdrawal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Withdrawal queue</h1>
        <p className="text-sm text-gray-500">Process pending tutor payout requests.</p>
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

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Pending requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load withdrawals.
            </div>
          )}

          {!isLoading && !error && withdrawals.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No pending withdrawals.
            </div>
          )}

          {!isLoading && !error && withdrawals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Request date</th>
                    <th className="py-3 pr-4">Tutor</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Available balance</th>
                    <th className="py-3 pr-4">Bank</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map((row: WithdrawalRow) => (
                    <tr key={row.withdrawal?.transactionId} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 text-gray-600">
                        {row.withdrawal?.requestedAt
                          ? new Date(row.withdrawal.requestedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{row.withdrawal?.amount || 0}</td>
                      <td className="py-3 pr-4 text-gray-700">{row.availableBalance || 0}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {row.bankDetails?.bankName || "N/A"} - {row.bankDetails?.accountNumber?.slice(-4) || "----"}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="secondary" onClick={() => openConfirm(row)}>
                          Process
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Processed withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          {processed.length === 0 ? (
            <p className="text-sm text-gray-500">No processed withdrawals yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Processed date</th>
                    <th className="py-3 pr-4">Tutor</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Gateway ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processed.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{entry.userId?.name || "N/A"}</td>
                      <td className="py-3 pr-4 text-gray-700">{entry.amount}</td>
                      <td className="py-3 pr-4 text-gray-500">{entry.gatewayId || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process withdrawal</DialogTitle>
            <DialogDescription>Confirm the transfer before marking the request as completed.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                Tutor: <span className="font-medium">{selected.name}</span>
              </p>
              <p className="text-gray-700">
                Amount: <span className="font-medium">{selected.withdrawal?.amount || 0}</span>
              </p>
              <p className="text-gray-700">
                Bank: <span className="font-medium">{selected.bankDetails?.bankName || "N/A"}</span>
              </p>
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                I have completed the bank transfer
              </label>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleProcess} disabled={!checked || isSubmitting}>
              <CheckCircle2 className="h-4 w-4" />
              Confirm processing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
