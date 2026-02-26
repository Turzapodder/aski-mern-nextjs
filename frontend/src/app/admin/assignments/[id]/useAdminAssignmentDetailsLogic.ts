import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { skipToken } from "@reduxjs/toolkit/query"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"
import { useGetSubmissionsQuery } from "@/lib/services/submissions"

export type AssignmentDetails = {
  assignment?: Record<string, any>
  chat?: Record<string, any>
  chatHistory?: Record<string, any>[]
  proposals?: Record<string, any>[]
}

export const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export const useAdminAssignmentDetailsLogic = () => {
  const params = useParams<{ id: string }>()
  const assignmentId = params?.id
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"delete" | "force-cancel">("delete")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    status: "",
    budget: "",
    deadline: ""
  })

  const { data, error, isLoading, mutate } = useSWR(
    assignmentId ? ["admin-assignment", assignmentId] : null,
    () => adminApi.assignments.getById(assignmentId)
  )
  const { data: submissionsData, isLoading: submissionsLoading } = useGetSubmissionsQuery(
    assignmentId ? { assignmentId } : skipToken
  )

  const payload = data?.data as AssignmentDetails | undefined
  const assignment = payload?.assignment
  const chat = payload?.chat
  const chatHistory = payload?.chatHistory ?? []
  const proposals = payload?.proposals ?? []

  useEffect(() => {
    if (assignment) {
      const deadline = assignment.deadline ? new Date(assignment.deadline) : null
      setFormData({
        title: assignment.title || "",
        description: assignment.description || "",
        subject: assignment.subject || "",
        status: assignment.status || "pending",
        budget: String(assignment.budget ?? assignment.estimatedCost ?? ""),
        deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline.toISOString().slice(0, 10) : ""
      })
    }
  }, [assignment])

  const openDialog = (mode: "delete" | "force-cancel") => {
    setDialogMode(mode)
    setReason("")
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!assignment?._id) return
    setIsSubmitting(true)
    try {
      if (dialogMode === "delete") {
        await adminApi.assignments.delete(assignment._id, reason)
        toast.success("Assignment deleted")
      } else {
        await adminApi.assignments.forceCancel(assignment._id, reason)
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

  const handleSave = async () => {
    if (!assignment?._id) return
    const budgetValue = Number(formData.budget)
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      toast.error("Budget must be a positive number")
      return
    }
    setIsSaving(true)
    try {
      await adminApi.assignments.update(assignment._id, {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        status: formData.status,
        budget: budgetValue,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      })
      toast.success("Assignment updated")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Update failed")
    } finally {
      setIsSaving(false)
    }
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000"
  
  const resolveFileUrl = (url?: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${apiBaseUrl}${url}`
  }

  return {
    dialogOpen, setDialogOpen,
    dialogMode, setDialogMode,
    reason, setReason,
    isSubmitting,
    isSaving,
    formData, setFormData,
    assignment,
    chat,
    chatHistory,
    proposals,
    submissionsData,
    submissionsLoading,
    openDialog,
    handleConfirm,
    handleSave,
    resolveFileUrl,
    isLoading,
    error
  }
}
