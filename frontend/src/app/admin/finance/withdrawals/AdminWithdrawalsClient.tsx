"use client"

import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AdminSectionNav from "@/components/admin/AdminSectionNav"
import { WithdrawalRow, useAdminWithdrawalsLogic } from "./useAdminWithdrawalsLogic"

export const AdminWithdrawalsClient = () => {
  const {
    withdrawals,
    processed,
    selected,
    confirmOpen, setConfirmOpen,
    checked, setChecked,
    isSubmitting,
    payoutReference, setPayoutReference,
    gateway, setGateway,
    note, setNote,
    openConfirm,
    handleProcess,
    isLoading,
    error
  } = useAdminWithdrawalsLogic();

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
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {withdrawals.map((row: WithdrawalRow) => (
                  <div key={row.withdrawal?.transactionId} className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm transition-all hover:border-amber-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{row.name}</p>
                        <p className="text-xs text-gray-500 truncate">{row.email}</p>
                      </div>
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] font-bold uppercase tracking-wider">
                        Pending
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Request Date</p>
                        <p className="text-xs font-medium text-gray-700">
                          {row.withdrawal?.requestedAt ? new Date(row.withdrawal.requestedAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Amount</p>
                        <p className="text-sm font-bold text-emerald-600">৳{row.withdrawal?.amount || 0}</p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-gray-50 pt-3">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Bank Details</p>
                        <p className="text-xs text-gray-600">
                          {row.bankDetails?.bankName || "N/A"} (****{row.bankDetails?.accountNumber?.slice(-4) || "----"})
                        </p>
                      </div>
                    </div>

                    <Button variant="secondary" className="mt-4 w-full rounded-xl" onClick={() => openConfirm(row)}>
                      Process Payout
                    </Button>
                  </div>
                ))}
              </div>
            </div>)}
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
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
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
                    {processed.map((entry: any) => (
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

              {/* Mobile Card View for Processed */}
              <div className="md:hidden space-y-4">
                {processed.map((entry: any) => (
                  <div key={entry._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-100">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-gray-900 text-sm">{entry.userId?.name || "N/A"}</p>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-bold uppercase tracking-wider">
                        Paid
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Paid On</p>
                        <p className="text-xs font-medium text-gray-700">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Amount</p>
                        <p className="text-sm font-bold text-gray-900">৳{entry.amount}</p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-gray-50 pt-3">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Transaction ID</p>
                        <p className="text-[10px] text-gray-500 font-mono truncate">{entry.gatewayId || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process withdrawal</DialogTitle>
            <DialogDescription>Confirm the transfer before marking the request as completed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {selected && (
              <>
                <p className="text-gray-700">
                  Tutor: <span className="font-medium">{selected.name}</span>
                </p>
                <p className="text-gray-700">
                  Amount: <span className="font-medium">{selected.withdrawal?.amount || 0}</span>
                </p>
                <p className="text-gray-700">
                  Bank: <span className="font-medium">{selected.bankDetails?.bankName || "N/A"}</span>
                </p>
              </>
            )}
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
              />
              I have completed the bank transfer
            </label>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Payout reference (optional)
              </p>
              <input
                type="text"
                value={payoutReference}
                onChange={(event) => setPayoutReference(event.target.value)}
                placeholder="Bank Txn ID / UTR / Ref no."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Gateway
              </p>
              <select
                value={gateway}
                onChange={(event) => setGateway(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Internal note (optional)
              </p>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Bank/account verification notes"
              />
            </div>
          </div>
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
