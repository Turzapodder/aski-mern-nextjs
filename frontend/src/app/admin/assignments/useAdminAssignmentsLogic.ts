import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import { skipToken } from "@reduxjs/toolkit/query"

import { adminApi } from "@/lib/adminApi"
import { useGetLatestSubmissionStatusByAssignmentsQuery } from "@/lib/services/submissions"

export type AssignmentRow = Record<string, any>

export const statusTone = (status?: string) => {
  switch (status) {
    case "created":
    case "pending":
    case "proposal_received":
      return "bg-blue-100 text-blue-700"
    case "proposal_accepted":
      return "bg-indigo-100 text-indigo-700"
    case "in_progress":
    case "submission_pending":
    case "assigned":
      return "bg-amber-100 text-amber-700"
    case "revision_requested":
      return "bg-orange-100 text-orange-700"
    case "submitted":
      return "bg-teal-100 text-teal-700"
    case "completed":
      return "bg-emerald-100 text-emerald-700"
    case "overdue":
    case "disputed":
      return "bg-rose-100 text-rose-700"
    case "resolved":
    case "cancelled":
      return "bg-gray-200 text-gray-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export const useAdminAssignmentsLogic = () => {
  const router = useRouter()
  const [status, setStatus] = useState("all")
  const [subject, setSubject] = useState("")
  const [minBudget, setMinBudget] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"delete" | "force-cancel">("delete")
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      status,
      subject: subject.trim() || undefined,
      minBudget: minBudget || undefined,
      maxBudget: maxBudget || undefined,
    }),
    [maxBudget, minBudget, page, status, subject]
  )

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-assignments", params],
    () => adminApi.assignments.getAll(params)
  )

  const assignments = useMemo(() => data?.data ?? [], [data?.data])
  const pagination = data?.pagination
  const assignmentIds = useMemo(
    () => assignments.map((assignment: AssignmentRow) => assignment._id),
    [assignments]
  )
  const { data: latestStatusesData } = useGetLatestSubmissionStatusByAssignmentsQuery(
    assignmentIds.length > 0 ? { assignmentIds } : skipToken
  )
  const latestStatuses = latestStatusesData?.data || {}

  const openDialog = (assignment: AssignmentRow, mode: "delete" | "force-cancel") => {
    setSelectedAssignment(assignment)
    setDialogMode(mode)
    setReason("")
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedAssignment?._id) return
    setIsSubmitting(true)
    try {
      if (dialogMode === "delete") {
        await adminApi.assignments.delete(selectedAssignment._id, reason)
        toast.success("Assignment deleted")
      } else {
        await adminApi.assignments.forceCancel(selectedAssignment._id, reason)
        toast.success("Assignment cancelled")
      }
      setDialogOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Action failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    router,
    status, setStatus,
    subject, setSubject,
    minBudget, setMinBudget,
    maxBudget, setMaxBudget,
    page, setPage,
    dialogOpen, setDialogOpen,
    dialogMode, setDialogMode,
    selectedAssignment, setSelectedAssignment,
    reason, setReason,
    isSubmitting, setIsSubmitting,
    assignments,
    pagination,
    latestStatuses,
    openDialog,
    handleConfirm,
    isLoading,
    error
  }
}
