import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"

export type DisputeDetails = {
  assignment?: Record<string, any>
  chatHistory?: Record<string, any>[]
  files?: {
    attachments?: Record<string, any>[]
    submissions?: Record<string, any>[]
  }
  escrowAmount?: number
  financiallyActionable?: boolean
  hasGatewayRefundData?: boolean
}

export const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export const useAdminDisputeDetailsLogic = () => {
  const params = useParams<{ id: string }>()
  const disputeId = params?.id
  const [resolutionType, setResolutionType] = useState<"refund" | "release" | "split">("refund")
  const [studentPercent, setStudentPercent] = useState(50)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    disputeId ? ["admin-dispute", disputeId] : null,
    () => adminApi.disputes.getById(disputeId)
  )

  const { data: settingsResponse } = useSWR("admin-settings-preview", () => adminApi.settings.get())

  const payload = data?.data as DisputeDetails | undefined
  const assignment = payload?.assignment
  const chatHistory = payload?.chatHistory ?? []
  const attachments = payload?.files?.attachments ?? []
  const submissions = payload?.files?.submissions ?? []
  const escrowAmount = payload?.escrowAmount || 0
  const financiallyActionable = Boolean(payload?.financiallyActionable)
  const hasGatewayRefundData = Boolean(payload?.hasGatewayRefundData)
  const platformFeeRate = settingsResponse?.data?.platformFeeRate || 0
  const minFee = settingsResponse?.data?.minTransactionFee || 0
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000"
  
  const resolveFileUrl = (url?: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${apiBaseUrl}${url}`
  }

  const summary = useMemo(() => {
    let studentAmount = 0
    let tutorAmount = 0
    let platformFee = 0

    if (resolutionType === "refund") {
      studentAmount = escrowAmount
    } else if (resolutionType === "release") {
      platformFee = platformFeeRate > 0 ? Math.max(escrowAmount * platformFeeRate, minFee) : 0
      tutorAmount = Math.max(0, escrowAmount - platformFee)
    } else {
      const percent = Math.min(100, Math.max(0, studentPercent))
      studentAmount = Number((escrowAmount * (percent / 100)).toFixed(2))
      const tutorShare = Math.max(0, escrowAmount - studentAmount)
      platformFee = platformFeeRate > 0 ? Math.max(tutorShare * platformFeeRate, minFee) : 0
      tutorAmount = Math.max(0, tutorShare - platformFee)
    }

    return {
      resolutionType,
      escrowAmount,
      studentAmount,
      tutorAmount,
      platformFee,
    }
  }, [escrowAmount, minFee, platformFeeRate, resolutionType, studentPercent])

  const handleResolve = async (note?: string) => {
    if (!assignment?._id) return
    setIsSubmitting(true)
    try {
      const response = await adminApi.disputes.resolve(assignment._id, {
        resolutionType,
        studentPercent: resolutionType === "split" ? studentPercent : undefined,
        reason: note,
      })
      if ((response?.data as any)?.noFinancialTransfer) {
        toast.success("Dispute resolved (no payout/refund because payment is not completed)")
      } else {
        toast.success("Dispute resolved")
      }
      setModalOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to resolve dispute")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    resolutionType, setResolutionType,
    studentPercent, setStudentPercent,
    modalOpen, setModalOpen,
    isSubmitting,
    assignment,
    chatHistory,
    attachments,
    submissions,
    escrowAmount,
    financiallyActionable,
    hasGatewayRefundData,
    resolveFileUrl,
    summary,
    handleResolve,
    isLoading,
    error
  }
}
