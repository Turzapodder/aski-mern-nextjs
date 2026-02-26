"use client"

import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Search, ShieldCheck, UserMinus, UserPlus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import BanUserModal from "@/components/admin/BanUserModal"
import AdminPagination from "@/components/admin/AdminPagination"
import { roleLabel, statusTone, useAdminUsersLogic } from "./useAdminUsersLogic"

export const AdminUsersClient = () => {
  const router = useRouter()
  const {
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
  } = useAdminUsersLogic();

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
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
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
                          <td className="py-3 pr-4 font-medium text-gray-900">
                            <button
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="hover:text-primary-600 hover:underline text-left transition-colors cursor-pointer"
                            >
                              {user.name}
                            </button>
                          </td>
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
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/users/${user.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4" />
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {users.map((user) => {
                  const isBanned = user.status === "banned"
                  return (
                    <div key={user.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 font-bold text-sm">
                            {user.name?.[0].toUpperCase()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <button
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="font-semibold text-gray-900 hover:text-primary-600 hover:underline transition-colors text-left truncate block w-full"
                            >
                              {user.name}
                            </button>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openModal(user, isBanned ? "unban" : "ban")}
                              className={isBanned ? "text-emerald-600 text-xs" : "text-rose-600 text-xs"}
                            >
                              {isBanned ? <UserPlus className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                              {isBanned ? "Unban user" : "Ban user"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Role</p>
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {roleLabel(user.roles)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Status</p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Spent</p>
                          <p className="text-xs font-semibold text-gray-900">৳{user.totalSpent || 0}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Joined</p>
                          <p className="text-[11px] text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!isLoading && pagination && pagination.pages > 1 && (
            <div className="mt-6">
              <AdminPagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={(p) => setPage(p)}
              />
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
