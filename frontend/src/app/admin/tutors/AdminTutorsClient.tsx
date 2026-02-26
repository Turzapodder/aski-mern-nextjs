"use client"

import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, UserMinus, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import BanUserModal from "@/components/admin/BanUserModal"
import AdminSectionNav from "@/components/admin/AdminSectionNav"
import AdminPagination from "@/components/admin/AdminPagination"
import { TutorRow, statusTone, useAdminTutorsLogic } from "./useAdminTutorsLogic"

export const AdminTutorsClient = () => {
  const router = useRouter()
  const {
    search, setSearch,
    minRating, setMinRating,
    page, setPage,
    banModalOpen, setBanModalOpen,
    selectedTutor,
    demoteOpen, setDemoteOpen,
    demoteReason, setDemoteReason,
    isSubmitting,
    filtered,
    paginatedTutors,
    totalPages,
    openBan,
    handleBan,
    openDemote,
    handleDemote,
    isLoading,
    error
  } = useAdminTutorsLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Active Tutors</h1>
        <p className="text-sm text-gray-500">Monitor verified tutors and manage account status.</p>
        <div className="mt-3">
          <AdminSectionNav
            items={[
              { label: "Active tutors", href: "/admin/tutors" },
              { label: "Verification queue", href: "/admin/tutors/verification" },
            ]}
          />
        </div>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-semibold">Tutor roster</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="sm:w-64"
            />
            <Input
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              placeholder="Min rating"
              className="sm:w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load tutor list.
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No tutors match the current filters.
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Verification</th>
                      <th className="py-3 pr-4">Rating</th>
                      <th className="py-3 pr-4">Earnings</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedTutors.map((tutor: TutorRow) => (
                      <tr key={tutor._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => router.push(`/admin/users/${tutor._id}`)}
                            className="hover:text-primary-600 hover:underline text-left transition-colors cursor-pointer"
                          >
                            <div className="font-semibold text-gray-900">{tutor.name}</div>
                            <div className="text-xs text-gray-500 font-normal">{tutor.email}</div>
                          </button>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-700">
                            {tutor.tutorProfile?.verificationStatus || "Pending"}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-gray-700">
                          <div className="flex items-center gap-1 font-medium">
                            <span className="text-amber-500 text-xs">★</span>
                            {tutor.publicStats?.averageRating || 0}
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-gray-900">৳{tutor.wallet?.totalEarnings || 0}</td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${statusTone(tutor.status)}`}>
                            {tutor.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm text-gray-500 hover:bg-gray-50 transition-all active:scale-95">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/users/${tutor._id}`)}
                                className="cursor-pointer gap-2"
                              >
                                <Eye className="h-4 w-4 text-gray-400" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDemote(tutor)} className="text-amber-600 cursor-pointer gap-2">
                                <UserMinus className="h-4 w-4" />
                                Demote tutor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openBan(tutor)} className="text-rose-600 cursor-pointer gap-2">
                                <UserX className="h-4 w-4" />
                                Ban tutor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedTutors.map((tutor: TutorRow) => (
                  <div key={tutor._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 font-bold text-base shadow-inner">
                          {tutor.name?.[0].toUpperCase()}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <button
                            onClick={() => router.push(`/admin/users/${tutor._id}`)}
                            className="font-bold text-gray-900 hover:text-primary-600 hover:underline transition-colors text-left text-sm truncate block w-full"
                          >
                            {tutor.name}
                          </button>
                          <p className="text-xs text-gray-500 truncate">{tutor.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/users/${tutor._id}`)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDemote(tutor)} className="text-amber-600 text-xs">
                            <UserMinus className="h-3.5 w-3.5" />
                            Demote tutor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openBan(tutor)} className="text-rose-600 text-xs">
                            <UserX className="h-3.5 w-3.5" />
                            Ban tutor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-gray-50 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Earnings</p>
                        <p className="text-sm font-bold text-gray-900">৳{tutor.wallet?.totalEarnings || 0}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Rating</p>
                        <div className="flex items-center justify-end gap-1 text-sm font-bold text-amber-600">
                          <span>★</span>
                          {tutor.publicStats?.averageRating || 0}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Verification</p>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold">
                          {tutor.tutorProfile?.verificationStatus || "Pending"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Status</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${statusTone(tutor.status)}`}>
                          {tutor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <AdminPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <BanUserModal
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        mode="ban"
        userName={selectedTutor?.name}
        isSubmitting={isSubmitting}
        onConfirm={handleBan}
      />

      <AlertDialog open={demoteOpen} onOpenChange={setDemoteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demote tutor</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the tutor role. Active assignments and pending withdrawals are checked before demotion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={demoteReason}
            onChange={(event) => setDemoteReason(event.target.value)}
            placeholder="Reason for demotion"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDemote} disabled={isSubmitting || demoteReason.trim().length === 0}>
              Confirm demotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
