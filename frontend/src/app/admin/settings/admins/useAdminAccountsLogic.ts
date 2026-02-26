import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi, AdminAccount } from "@/lib/adminApi"

export const useAdminAccountsLogic = () => {
  const { data, error, isLoading, mutate } = useSWR("admin-accounts", () => adminApi.admins.getAll())
  const admins = data?.data ?? []
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("admin")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!email.trim()) {
      toast.error("Provide an email address")
      return
    }
    setIsSubmitting(true)
    try {
      await adminApi.admins.add({ email: email.trim(), role })
      toast.success("Admin added")
      setEmail("")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to add admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = async (admin: AdminAccount, nextRole: string) => {
    if (!admin._id) return
    setIsSubmitting(true)
    try {
      await adminApi.admins.updateRole(admin._id, nextRole)
      toast.success("Role updated")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to update role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (admin: AdminAccount) => {
    if (!admin._id) return
    setIsSubmitting(true)
    try {
      await adminApi.admins.revoke(admin._id)
      toast.success("Admin access revoked")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to revoke access")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    admins,
    email, setEmail,
    role, setRole,
    isSubmitting,
    handleAdd,
    handleRoleChange,
    handleRevoke,
    isLoading,
    error
  }
}
