"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { ShieldMinus, UserPlus } from "lucide-react"

import { adminApi, AdminAccount } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminAccountsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin accounts</h1>
        <p className="text-sm text-gray-500">Manage admin access and permissions.</p>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add admin</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="User email"
            className="sm:w-72"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={isSubmitting}>
            <UserPlus className="h-4 w-4" />
            Add admin
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Admin list</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load admin list.
            </div>
          )}

          {!isLoading && !error && admins.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No admins found.
            </div>
          )}

          {!isLoading && !error && admins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Last login</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 font-medium text-gray-900">{admin.name || "Admin"}</td>
                      <td className="py-3 pr-4 text-gray-600">{admin.email || "N/A"}</td>
                      <td className="py-3 pr-4">
                        <Select
                          value={admin.adminRole || "admin"}
                          onValueChange={(value) => handleRoleChange(admin, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(admin)}
                          disabled={isSubmitting}
                        >
                          <ShieldMinus className="h-4 w-4" />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
