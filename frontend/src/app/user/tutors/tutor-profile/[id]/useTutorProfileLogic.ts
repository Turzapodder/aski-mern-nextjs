import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetUserQuery } from '@/lib/services/auth'
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency'

export interface PublicTutor {
    _id: string
    name: string
    profileImage?: string
    about?: string
    city?: string
    country?: string
    languages?: string[]
    tutorProfile?: {
        bio?: string
        expertiseSubjects?: string[]
        skills?: string[]
        hourlyRate?: number
        experienceYears?: number
        verificationStatus?: string
        professionalTitle?: string
        qualification?: string
        currentInstitution?: string
        teachingMode?: string
        achievements?: string
        availableDays?: string[]
        availableTimeSlots?: Array<{ day?: string; slots?: string[] }>
    }
    publicStats?: {
        averageRating?: number
        totalReviews?: number
        totalProjects?: number
        completedProjects?: number
        responseTime?: number
    }
    joinedDate?: string
}

export const useTutorProfileLogic = () => {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [tutor, setTutor] = useState<PublicTutor | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reportOpen, setReportOpen] = useState(false)
    const { data: viewerData } = useGetUserQuery()
    const viewer = viewerData?.user
    const currency = viewer?.wallet?.currency || DEFAULT_CURRENCY
    const formatAmount = (value?: number) => formatCurrency(value, currency)
    const reporterType = viewer?.roles?.includes('tutor') ? 'tutor' : 'user'
    const canReportTutor = Boolean(viewer) && reporterType === 'user'
    const canRequestProposal = !viewer || !viewer.roles?.includes('tutor')
    const isOwner = Boolean(viewer?._id && tutor?._id && viewer._id === tutor._id)

    useEffect(() => {
        const fetchTutor = async () => {
            if (!params?.id) {
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(
                    `${baseUrl}/api/tutors/profile/${encodeURIComponent(params.id)}`
                )

                if (!response.ok) {
                    throw new Error('Tutor not found')
                }

                const result = await response.json()
                if (!result?.success) {
                    throw new Error(result?.error || 'Tutor not found')
                }

                setTutor(result?.data?.tutor || null)
            } catch (fetchError: any) {
                setError(fetchError?.message || 'Unable to load tutor')
                setTutor(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTutor()
    }, [params?.id])

    const tutorData = useMemo(() => {
        if (!tutor) return null

        const subjects = tutor.tutorProfile?.expertiseSubjects || []
        const skills = tutor.tutorProfile?.skills || []
        const tags = Array.from(new Set([...subjects, ...skills])).slice(0, 12)
        const rating = tutor.publicStats?.averageRating ?? 0
        const totalReviews = tutor.publicStats?.totalReviews ?? 0
        const totalProjects = tutor.publicStats?.totalProjects ?? 0
        const completedProjects = tutor.publicStats?.completedProjects ?? 0
        const responseTime = tutor.publicStats?.responseTime ?? 0
        const experienceYears = tutor.tutorProfile?.experienceYears
        const location = [tutor.city, tutor.country].filter(Boolean).join(', ')

        return {
            name: tutor.name,
            subject: subjects[0] ? `${subjects[0]} tutor` : (tutor.tutorProfile?.professionalTitle || 'Tutor'),
            rating,
            reviewsCount: totalReviews,
            isTopTutor: rating >= 4.8,
            isVerified: tutor.tutorProfile?.verificationStatus === 'Verified',
            bio: tutor.tutorProfile?.bio || tutor.about || 'No bio provided yet.',
            tags: tags.length > 0 ? tags : subjects,
            stats: {
                experience: experienceYears ? `${experienceYears}+ years` : 'N/A',
                courses: totalProjects,
                students: totalReviews,
                lessons: completedProjects
            },
            price: tutor.tutorProfile?.hourlyRate,
            response_time: responseTime ? `${responseTime}-hour` : 'Flexible',
            booked_stats: completedProjects
                ? `${completedProjects} lessons completed`
                : 'New tutor',
            profileImage: tutor.profileImage || '/assets/tutor-profile.svg',
            location,
            languages: tutor.languages || []
        }
    }, [tutor])

    const availability = useMemo(() => {
        const days = tutor?.tutorProfile?.availableDays || []
        const timeSlots = tutor?.tutorProfile?.availableTimeSlots || []
        const slotsByDay = new Map<string, string[]>()

        timeSlots.forEach((entry) => {
            const day = typeof entry?.day === 'string' ? entry.day : ''
            const slots = Array.isArray(entry?.slots) ? entry.slots.filter(Boolean) : []
            if (day) {
                slotsByDay.set(day, slots)
            }
        })

        days.forEach((day) => {
            if (!slotsByDay.has(day)) {
                slotsByDay.set(day, [])
            }
        })

        return Array.from(slotsByDay.entries()).map(([day, slots]) => ({
            day,
            slots
        }))
    }, [tutor])

    const detailItems = useMemo(() => {
        if (!tutor) return []
        const items = [
            { label: 'Professional title', value: tutor.tutorProfile?.professionalTitle },
            { label: 'Qualification', value: tutor.tutorProfile?.qualification },
            { label: 'Institution', value: tutor.tutorProfile?.currentInstitution },
            { label: 'Teaching mode', value: tutor.tutorProfile?.teachingMode },
            { label: 'Achievements', value: tutor.tutorProfile?.achievements }
        ]
        return items.filter((item) => item.value)
    }, [tutor])

    return {
        router,
        tutor,
        loading,
        error,
        reportOpen,
        setReportOpen,
        currency,
        formatAmount,
        reporterType,
        canReportTutor,
        canRequestProposal,
        isOwner,
        tutorData,
        availability,
        detailItems
    }
}
