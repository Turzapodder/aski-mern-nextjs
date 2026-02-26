"use client"
// TutorComponent — thin orchestrator after split
// Sub-components: TutorCard (tutors/TutorCard), TutorFilters (tutors/TutorFilters)
import React, { useEffect, useMemo, useState, useCallback } from "react"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useCurrency from "@/lib/hooks/useCurrency"
import { TutorCard, type Teacher } from "./TutorCard"
import { TutorFilters } from "./TutorFilters"

interface Tutor {
  id: string
  name: string
  avatar?: string
  bio?: string
  publicStats?: { averageRating?: number; totalProjects?: number; completedProjects?: number; totalReviews?: number }
  hourlyRate?: number
  skills?: string[]
  subjects?: string[]
}

const EMPTY_FILTERS = { subject: "", minRating: "", maxRate: "", skills: "", availability: "" }

const TutorComponent = () => {
  const { format: formatAmount } = useCurrency()
  const [isTeacherAccountActive, setIsTeacherAccountActive] = useState(false)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchTutors = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.subject) params.set("subject", filters.subject)
      if (filters.minRating) params.set("minRating", filters.minRating)
      if (filters.maxRate) params.set("maxRate", filters.maxRate)
      if (filters.skills) params.set("skills", filters.skills)
      if (filters.availability) params.set("availability", filters.availability)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${baseUrl}/api/tutors${params.toString() ? `?${params}` : ""}`)
      if (!res.ok) throw new Error("Failed to load tutors")
      const result = await res.json()
      if (!result?.success) throw new Error(result?.error || "Failed to load tutors")
      setTutors(Array.isArray(result.data) ? result.data : [])
    } catch (e: any) { setError(e?.message || "Unable to load tutors") }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchTutors() }, [fetchTutors])

  const teacherSections = useMemo(() => {
    const sections = new Map<string, Teacher[]>()
    tutors.forEach((tutor, index) => {
      const rating = tutor.publicStats?.averageRating ?? 0
      const totalProjects = tutor.publicStats?.totalProjects ?? 0
      const completedProjects = tutor.publicStats?.completedProjects ?? 0
      const totalReviews = tutor.publicStats?.totalReviews ?? 0
      const subjectName = tutor.subjects?.[0] || "Tutors"
      const sectionTitle = subjectName ? `${subjectName} teachers` : "Tutors"
      const teacher: Teacher = {
        id: tutor.id, name: tutor.name, subject: subjectName ? `${subjectName} teacher` : "Tutor",
        bio: tutor.bio || "No bio available yet.", lessons: completedProjects, courses: totalProjects,
        students: totalReviews, rating, price: tutor.hourlyRate || 0,
        isTopTutor: rating >= 4.8, isNewTutor: totalProjects > 0 && totalProjects < 5,
        isHighDemand: completedProjects >= 20, badges: tutor.skills?.slice(0, 1),
        image: tutor.avatar || "/assets/tutor-profile.svg", theme: index % 3 === 0 ? "dark" : "light",
      }
      if (!sections.has(sectionTitle)) sections.set(sectionTitle, [])
      sections.get(sectionTitle)?.push(teacher)
    })
    return Array.from(sections.entries())
  }, [tutors])

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers</h1>
          <p className="text-gray-500 text-[15px]">
            Search for specific subjects and find the teachers you&apos;re ready to take a course with.
          </p>
        </div>
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsTeacherAccountActive((p) => !p)}
            className="relative inline-flex h-12 w-fit items-center rounded-xl p-1 transition-colors focus:outline-none bg-purple-100 pr-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-6 flex items-center rounded-full px-1 duration-300 ease-in-out ${isTeacherAccountActive ? "bg-purple-600 justify-end" : "bg-gray-500 justify-start"}`}>
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out" />
              </div>
              <span className="text-sm font-medium text-gray-800">Activate teacher account</span>
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500">?</div>
            </div>
          </button>
        </div>
      </div>

      <TutorFilters
        filters={filters}
        filtersOpen={filtersOpen}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
      />

      {loading && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      )}
      {error && <div className="text-sm text-red-600 mb-8">{error}</div>}
      {!loading && !error && tutors.length === 0 && <div className="text-sm text-gray-500 mb-8">No tutors found.</div>}

      {!loading && !error && tutors.length > 0 && (
        <>
          {teacherSections.map(([sectionTitle, sectionTeachers]) => (
            <div className="mb-12" key={sectionTitle}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-800">{sectionTitle}</h2>
                <button className="text-sm font-semibold text-purple-600 flex items-center hover:text-purple-700">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionTeachers.map((teacher) => (
                  <TutorCard key={teacher.id} teacher={teacher} formatAmount={formatAmount} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default TutorComponent
