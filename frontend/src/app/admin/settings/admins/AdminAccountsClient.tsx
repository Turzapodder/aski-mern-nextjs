"use client"

import { ShieldMinus, UserPlus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminAccountsLogic } from "./useAdminAccountsLogic"

export const AdminAccountsClient = () => {
  const {
    admins,
    email, setEmail,
    role, setRole,
    isSubmitting,
    handleAdd,
    handleRoleChange,
    handleRevoke,
    isLoading,
    error
  } = useAdminAccountsLogic();

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
