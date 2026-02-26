import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"

export type WithdrawalRow = Record<string, any>

export const useAdminWithdrawalsLogic = () => {
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
  const [payoutReference, setPayoutReference] = useState("")
  const [gateway, setGateway] = useState("bank_transfer")
  const [note, setNote] = useState("")

  const openConfirm = (row: WithdrawalRow) => {
    setSelected(row)
    setChecked(false)
    setPayoutReference("")
    setGateway("bank_transfer")
    setNote("")
    setConfirmOpen(true)
  }

  const handleProcess = async () => {
    if (!selected?.withdrawal?.transactionId) return
    setIsSubmitting(true)
    try {
      await adminApi.finance.processWithdrawal(selected.withdrawal.transactionId, {
        payoutReference: payoutReference.trim(),
        gateway,
        note: note.trim(),
      })
      toast.success("Withdrawal processed")
      setConfirmOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to process withdrawal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
