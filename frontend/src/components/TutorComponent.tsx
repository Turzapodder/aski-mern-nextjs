'use client'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Search, Filter, Bookmark, ChevronDown, CheckCircle, Flame, Star, BookOpen, User, GraduationCap, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import useCurrency from '@/lib/hooks/useCurrency'

interface Tutor {
  id: string
  name: string
  avatar?: string
  bio?: string
  publicStats?: {
    averageRating?: number
    totalProjects?: number
    completedProjects?: number
    totalReviews?: number
  }
  hourlyRate?: number
  skills?: string[]
  subjects?: string[]
}

interface Teacher {
  id: string
  name: string
  subject: string
  bio: string
  lessons: number
  courses: number
  students: number
  rating: number
  price: number
  originalPrice?: number
  isTopTutor?: boolean
  isCertified?: boolean
  isNewTutor?: boolean
  isHighDemand?: boolean
  isOnlines?: boolean
  image: string
  badges?: string[]
  theme: 'dark' | 'light'
}

const TutorComponent = () => {
  const { format: formatAmount } = useCurrency()
  const [isTeacherAccountActive, setIsTeacherAccountActive] = useState(false)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    subject: '',
    minRating: '',
    maxRate: '',
    skills: '',
    availability: ''
  })
  const [filtersOpen, setFiltersOpen] = useState(false)

  const toggleTeacherAccount = () => {
    setIsTeacherAccountActive(!isTeacherAccountActive)
  }

  const fetchTutors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.subject) params.set('subject', filters.subject)
      if (filters.minRating) params.set('minRating', filters.minRating)
      if (filters.maxRate) params.set('maxRate', filters.maxRate)
      if (filters.skills) params.set('skills', filters.skills)
      if (filters.availability) params.set('availability', filters.availability)

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const queryString = params.toString()
      const response = await fetch(
        `${baseUrl}/api/tutors${queryString ? `?${queryString}` : ''}`
      )

      if (!response.ok) {
        throw new Error('Failed to load tutors')
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to load tutors')
      }

      setTutors(Array.isArray(result.data) ? result.data : [])
    } catch (fetchError: any) {
      setError(fetchError?.message || 'Unable to load tutors')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTutors()
  }, [fetchTutors])

  const teacherSections = useMemo(() => {
    const sections = new Map<string, Teacher[]>()

    tutors.forEach((tutor, index) => {
      const rating = tutor.publicStats?.averageRating ?? 0
      const totalProjects = tutor.publicStats?.totalProjects ?? 0
      const completedProjects = tutor.publicStats?.completedProjects ?? 0
      const totalReviews = tutor.publicStats?.totalReviews ?? 0
      const subjectName = tutor.subjects?.[0] || 'Tutors'
      const sectionTitle = subjectName ? `${subjectName} teachers` : 'Tutors'

      const teacher: Teacher = {
        id: tutor.id,
        name: tutor.name,
        subject: subjectName ? `${subjectName} teacher` : 'Tutor',
        bio: tutor.bio || 'No bio available yet.',
        lessons: completedProjects,
        courses: totalProjects,
        students: totalReviews,
        rating,
        price: tutor.hourlyRate || 0,
        isTopTutor: rating >= 4.8,
        isNewTutor: totalProjects > 0 && totalProjects < 5,
        isHighDemand: completedProjects >= 20,
        badges: tutor.skills?.slice(0, 1),
        image: tutor.avatar || '/assets/tutor-profile.svg',
        theme: index % 3 === 0 ? 'dark' : 'light'
      }

      if (!sections.has(sectionTitle)) {
        sections.set(sectionTitle, [])
      }
      sections.get(sectionTitle)?.push(teacher)
    })

    return Array.from(sections.entries())
  }, [tutors])

  const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
    const isDark = teacher.theme === 'dark'

    return (
      <div className={`rounded-2xl p-6 relative flex flex-col h-full transition-transform hover:scale-[1.01] duration-200 ${isDark ? 'bg-[#18181b] text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'
        }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {teacher.isTopTutor && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    TOP Tutor
                  </span>
                )}
                {teacher.isCertified && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-purple-100 text-purple-700">
                    Certified
                  </span>
                )}
                {teacher.isNewTutor && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-blue-100 text-blue-700">
                    New Tutor
                  </span>
                )}
                {teacher.isHighDemand && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-rose-100 text-rose-700">
                    High Demand
                  </span>
                )}
                {teacher.badges && teacher.badges.map((badge, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge === 'IELTS' ? 'bg-black text-white' : 'bg-purple-100 text-purple-700'
                    }`}>
                    {badge}
                  </span>
                ))}
                <span className="flex items-center text-xs font-bold text-amber-400">
                  <Star className="w-3 h-3 fill-current mr-0.5" />
                  {teacher.rating}
                </span>
                {teacher.badges && teacher.badges.includes('+2') && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                    +2
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[15px]">{teacher.name}</h3>
                <CheckCircle className="w-4 h-4 text-purple-500 fill-purple-500 stroke-white" />
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{teacher.subject}</p>
            </div>
          </div>
          <button className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 bg-[#27272a] text-purple-400' : 'hover:bg-gray-100 text-gray-400'
            }`}>
            <Bookmark className={`w-5 h-5 ${isDark ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className={`text-[13px] leading-relaxed mb-6 flex-grow ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {teacher.bio}
        </p>

        <div className={`grid grid-cols-2 gap-y-2 text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>{teacher.lessons} lessons conducted</span>
          </div>
          <div className="col-span-1"></div>

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{teacher.courses} courses</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{teacher.students}+ students</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1">
            {isDark && <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />}
            {teacher.price > 0 ? (
              <>
                <span className="text-xl font-bold">{formatAmount(teacher.price)}</span>
                {teacher.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatAmount(teacher.originalPrice)}/hr
                  </span>
                )}
                {!teacher.originalPrice && (
                  <span className="text-xs text-gray-500 top-0">/hr</span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-500">
                Contact for pricing
              </span>
            )}
          </div>
          <a href={`/user/tutors/tutor-profile/${teacher.id}`} className={`px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors ${isDark
            ? 'bg-white text-black hover:bg-gray-100'
            : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}>
            View More
          </a>
        </div>
      </div>
    )
  }

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
            onClick={toggleTeacherAccount}
            className={`relative inline-flex h-12 w-fit items-center rounded-xl p-1 transition-colors focus:outline-none bg-purple-100 pr-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-6 flex items-center rounded-full px-1 duration-300 ease-in-out ${isTeacherAccountActive ? 'bg-purple-600 justify-end' : 'bg-gray-500 justify-start'}`}>
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div>
              </div>
              <span className="text-sm font-medium text-gray-800">Activate teacher account</span>
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500">?</div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers"
            value={filters.subject}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, subject: event.target.value }))
            }
            className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm outline-none text-gray-700 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm ring-1 ring-gray-100 cursor-pointer min-w-max">
            <span className="text-sm text-gray-500">Sort:</span>
            <span className="text-sm font-medium text-gray-900">Most popular</span>
            <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          </div>

          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 ${filtersOpen ? 'ring-purple-200' : ''}`}
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>

          <button className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
            <Bookmark className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Min rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, minRating: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g. 4.5"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Max rate</label>
              <input
                type="number"
                min="0"
                step="1"
                value={filters.maxRate}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, maxRate: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, skills: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g. Algebra, Geometry"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Availability</label>
              <input
                type="text"
                value={filters.availability}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, availability: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g. Sunday, Monday"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Use comma-separated values for skills and availability.
            </p>
            <button
              onClick={() =>
                setFilters({
                  subject: '',
                  minRating: '',
                  maxRate: '',
                  skills: '',
                  availability: ''
                })
              }
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 mb-8">{error}</div>
      )}
      {!loading && !error && tutors.length === 0 && (
        <div className="text-sm text-gray-500 mb-8">No tutors found.</div>
      )}

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
                {sectionTeachers.map(teacher => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
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



