"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MoreHorizontal, UserMinus, UserX } from "lucide-react"
import { toast } from "sonner"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import BanUserModal from "@/components/admin/BanUserModal"
import AdminSectionNav from "@/components/admin/AdminSectionNav"

type TutorRow = Record<string, any>

const statusTone = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700"
    case "banned":
      return "bg-rose-100 text-rose-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export default function AdminTutorsPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR("admin-tutors-active", () =>
    adminApi.tutors.getActive()
  )

  const tutors = useMemo(() => data?.data ?? [], [data])
  const [search, setSearch] = useState("")
  const [minRating, setMinRating] = useState("")
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState<TutorRow | null>(null)
  const [demoteOpen, setDemoteOpen] = useState(false)
  const [demoteReason, setDemoteReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = useMemo(() => {
    const ratingValue = Number(minRating)
    return tutors.filter((tutor: TutorRow) => {
      const matchesSearch =
        !search ||
        tutor.name?.toLowerCase().includes(search.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(search.toLowerCase())
      const rating = tutor.publicStats?.averageRating || 0
      const matchesRating = !minRating || rating >= (Number.isFinite(ratingValue) ? ratingValue : 0)
      return matchesSearch && matchesRating
    })
  }, [minRating, search, tutors])

  const openBan = (tutor: TutorRow) => {
    setSelectedTutor(tutor)
    setBanModalOpen(true)
  }

  const handleBan = async (reason?: string) => {
    if (!selectedTutor?._id) return
    setIsSubmitting(true)
    try {
      await adminApi.users.ban(selectedTutor._id, reason)
      toast.success("Tutor banned successfully")
      setBanModalOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to ban tutor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDemote = (tutor: TutorRow) => {
    setSelectedTutor(tutor)
    setDemoteReason("")
    setDemoteOpen(true)
  }

  const handleDemote = async () => {
    if (!selectedTutor?._id) return
    setIsSubmitting(true)
    try {
      await adminApi.tutors.demote(selectedTutor._id, demoteReason)
      toast.success("Tutor demoted successfully")
      setDemoteOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to demote tutor")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <div className="overflow-x-auto">
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
                  {filtered.map((tutor: TutorRow) => (
                    <tr key={tutor._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900">{tutor.name}</div>
                        <div className="text-xs text-gray-500">{tutor.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{tutor.tutorProfile?.verificationStatus || "Pending"}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{tutor.publicStats?.averageRating || 0}</td>
                      <td className="py-3 pr-4 text-gray-700">{tutor.wallet?.totalEarnings || 0}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(tutor.status)}`}>
                          {tutor.status}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${tutor._id}`)}>
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDemote(tutor)} className="text-amber-600">
                              <UserMinus className="h-4 w-4" />
                              Demote tutor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openBan(tutor)} className="text-rose-600">
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
