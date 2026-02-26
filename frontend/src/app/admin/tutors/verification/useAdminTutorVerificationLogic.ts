import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"

export type TutorApplication = Record<string, any>

export const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString()
}

export const useAdminTutorVerificationLogic = () => {
  const { data, error, isLoading, mutate } = useSWR("admin-tutor-pending", () =>
    adminApi.tutors.getPending()
  )

  const applications = useMemo(() => data?.data ?? [], [data])
  const [selected, setSelected] = useState<TutorApplication | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openReview = (application: TutorApplication) => {
    setSelected(application)
    setRejectReason("")
    setReviewOpen(true)
  }

  const handleApprove = async () => {
    if (!selected?.user?._id) return
    setIsSubmitting(true)
    try {
      await adminApi.tutors.verify(selected.user._id)
      toast.success("Tutor verified successfully")
      setReviewOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to verify tutor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selected?.user?._id) return
    setIsSubmitting(true)
    try {
      await adminApi.tutors.reject(selected.user._id, rejectReason)
      toast.success("Tutor rejected")
      setReviewOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to reject tutor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    applications,
    selected,
    reviewOpen, setReviewOpen,
    rejectReason, setRejectReason,
    isSubmitting,
    openReview,
    handleApprove,
    handleReject,
    isLoading,
    error
  }
}
