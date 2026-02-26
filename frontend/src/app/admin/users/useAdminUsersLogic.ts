import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi, AdminUserSummary } from "@/lib/adminApi"

export const roleLabel = (roles: string[]) => {
  if (roles.includes("admin")) return "Admin"
  if (roles.includes("tutor")) return "Tutor"
  if (roles.includes("student")) return "Student"
  return "User"
}

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

export const useAdminUsersLogic = () => {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"ban" | "unban">("ban")
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      role,
      status,
      search: search.trim() || undefined,
    }),
    [page, role, search, status]
  )

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-users", params],
    () => adminApi.users.getAll(params)
  )

  const users = data?.data ?? []
  const pagination = data?.pagination

  const openModal = (user: AdminUserSummary, mode: "ban" | "unban") => {
    setSelectedUser(user)
    setModalMode(mode)
    setModalOpen(true)
  }

  const handleConfirm = async (reason?: string) => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      if (modalMode === "ban") {
        await adminApi.users.ban(selectedUser.id, reason)
        toast.success("User banned successfully")
      } else {
        await adminApi.users.unban(selectedUser.id)
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
    search, setSearch,
    role, setRole,
    status, setStatus,
    page, setPage,
    modalOpen, setModalOpen,
    modalMode, setModalMode,
    selectedUser, setSelectedUser,
    isSubmitting,
    users,
    pagination,
    openModal,
    handleConfirm,
    isLoading,
    error
  }
}
