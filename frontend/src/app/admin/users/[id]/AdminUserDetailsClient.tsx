"use client"

import { Ban, Mail, Phone, ShieldCheck, Wallet } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import BanUserModal from "@/components/admin/BanUserModal"
import { formatDate, statusTone, useAdminUserDetailsLogic } from "./useAdminUserDetailsLogic"

export const AdminUserDetailsClient = () => {
  const {
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
  } = useAdminUserDetailsLogic();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Unable to load user details.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-600">
              {(user.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {roleLabel}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(user.status)}`}>
                  {user.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => openModal(isBanned ? "unban" : "ban")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              isBanned
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <Ban className="h-4 w-4" />
            {isBanned ? "Unban user" : "Ban user"}
          </button>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {roles.includes("tutor") && <TabsTrigger value="tutor">Tutor</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Profile details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last login</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {[user.city, user.country].filter(Boolean).join(", ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Onboarding status</p>
                <p className="text-sm font-medium text-gray-900">{user.onboardingStatus || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Wallet overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Wallet className="h-4 w-4" />
                  Available balance
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {wallet?.availableBalance?.toLocaleString?.() || 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Escrow balance</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {wallet?.escrowBalance?.toLocaleString?.() || 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Total earnings</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {wallet?.totalEarnings?.toLocaleString?.() || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 && (
                  <p className="text-sm text-gray-500">No assignments recorded.</p>
                )}
                {assignments.length > 0 && (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                        <p className="text-xs text-gray-500">
                          {assignment.status} | {formatDate(assignment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Admin activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activity.length === 0 && (
                  <p className="text-sm text-gray-500">No admin actions logged.</p>
                )}
                {activity.length > 0 && (
                  <div className="space-y-3">
                    {activity.map((entry) => (
                      <div key={entry._id} className="rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.actionType.replace(/_/g, " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.adminId?.name || "Admin"} | {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {roles.includes("tutor") && (
          <TabsContent value="tutor">
            <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tutor profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Verification status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.tutorProfile?.verificationStatus || "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hourly rate</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.tutorProfile?.hourlyRate || 0}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Skills</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.tutorProfile?.skills?.join(", ") || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <BanUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        userName={user?.name}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
