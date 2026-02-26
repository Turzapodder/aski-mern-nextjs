import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi, AdminLogEntry } from "@/lib/adminApi"

export const statusTone = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700"
    case "banned":
      return "bg-rose-100 text-rose-700"
    case "suspended":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString()
}

export const useAdminUserDetailsLogic = () => {
  const params = useParams<{ id: string }>()
  const userId = params?.id
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"ban" | "unban">("ban")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["admin-user", userId] : null,
    () => adminApi.users.getById(userId)
  )

  const details = data?.data
  const user = details?.user as Record<string, any> | undefined
  const wallet = details?.wallet as Record<string, any> | undefined
  const assignments = (details?.assignments as Record<string, any>[]) || []
  const activity = (details?.recentActivity as AdminLogEntry[]) || []

  const isBanned = user?.status === "banned"
  const roles = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []), [user?.roles])
  const roleLabel = useMemo(() => {
    if (roles.includes("admin")) return "Admin"
    if (roles.includes("tutor")) return "Tutor"
    if (roles.includes("student")) return "Student"
    return "User"
  }, [roles])

  const openModal = (mode: "ban" | "unban") => {
    setModalMode(mode)
    setModalOpen(true)
  }

  const handleConfirm = async (reason?: string) => {
    if (!userId) return
    setIsSubmitting(true)
    try {
      if (modalMode === "ban") {
        await adminApi.users.ban(userId, reason)
        toast.success("User banned successfully")
      } else {
        await adminApi.users.unban(userId)
        toast.success("User unbanned successfully")
      }
      setModalOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Action failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    modalOpen, setModalOpen,
    modalMode, setModalMode,
    isSubmitting,
    user,
    wallet,
    assignments,
    activity,
    isBanned,
    roles,
    roleLabel,
    openModal,
    handleConfirm,
    isLoading,
    error
  }
}
