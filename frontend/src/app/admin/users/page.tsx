"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MoreHorizontal, Search, ShieldCheck, UserMinus, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { adminApi, AdminUserSummary } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import BanUserModal from "@/components/admin/BanUserModal"

const roleLabel = (roles: string[]) => {
  if (roles.includes("admin")) return "Admin"
  if (roles.includes("tutor")) return "Tutor"
  if (roles.includes("student")) return "Student"
  return "User"
}

const statusTone = (status?: string) => {
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

export default function AdminUsersPage() {
  const router = useRouter()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage student and tutor accounts across the platform.</p>
        </div>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-semibold">User Directory</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="tutor">Tutors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load users. Please try again.
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No users found for the selected filters.
            </div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Join Date</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const isBanned = user.status === "banned"
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/60">
                        <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {roleLabel(user.roles)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {Number.isFinite(user.totalSpent) ? user.totalSpent.toLocaleString() : "0"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal(user, isBanned ? "unban" : "ban")}
                                className={isBanned ? "text-emerald-600" : "text-rose-600"}
                              >
                                {isBanned ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                                {isBanned ? "Unban user" : "Ban user"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BanUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        userName={selectedUser?.name}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
