import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"

export type TutorRow = Record<string, any>

export const statusTone = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700"
    case "banned":
      return "bg-rose-100 text-rose-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export const useAdminTutorsLogic = () => {
  const { data, error, isLoading, mutate } = useSWR("admin-tutors-active", () =>
    adminApi.tutors.getActive()
  )

  const tutors = useMemo(() => data?.data ?? [], [data])
  const [search, setSearch] = useState("")
  const [minRating, setMinRating] = useState("")
  const [page, setPage] = useState(1)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState<TutorRow | null>(null)
  const [demoteOpen, setDemoteOpen] = useState(false)
  const [demoteReason, setDemoteReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const itemsPerPage = 10

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

  const paginatedTutors = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

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

  return {
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
  }
}
