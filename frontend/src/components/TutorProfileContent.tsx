'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Star, CheckCircle, ShieldCheck, MessageSquare, MonitorPlay, Clock, Calendar as CalendarIcon, Award, Zap, User, GraduationCap, MapPin, Edit, Copy } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useGetUserQuery } from '@/lib/services/auth'
import useCurrency from '@/lib/hooks/useCurrency'

interface PublicTutor {
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

const TutorProfileContent = () => {
    const { format: formatAmount } = useCurrency()
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { data: userData } = useGetUserQuery()
    const [tutor, setTutor] = useState<PublicTutor | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const isOwner = userData?.user?._id === params?.id
    const canRequestProposal = !userData?.user || !userData.user.roles?.includes('tutor')

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

    const handleShareProfile = () => {
        const publicUrl = `${window.location.origin}/public/tutor-profile/${params.id}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) {
        return (
            <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
                <div className="text-sm text-gray-500">Loading tutor profile...</div>
            </div>
        )
    }

    if (error || !tutorData) {
        return (
            <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
                <div className="text-sm text-gray-600">{error || 'Tutor not found'}</div>
            </div>
        )
    }

    return (
        <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-5 mb-6">
                            <div className="relative shrink-0">
                                <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden relative">
                                    <Image
                                        src={tutorData.profileImage}
                                        alt={tutorData.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {tutorData.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                        <ShieldCheck className="w-5 h-5 text-purple-600 fill-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {tutorData.isTopTutor && (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-emerald-100 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    TOP Tutor
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {tutorData.rating}
                                            </div>
                                            <span className="text-xs text-gray-500 underline decoration-gray-300">based on {tutorData.reviewsCount} reviews</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold text-gray-900">{tutorData.name}</h1>
                                            <div className="text-purple-600">
                                                <CheckCircle className="w-5 h-5 fill-purple-600 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 font-medium">{tutorData.subject}</p>
                                        {(tutorData.location || tutorData.languages.length > 0) && (
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                {tutorData.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {tutorData.location}
                                                    </span>
                                                )}
                                                {tutorData.languages.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium text-gray-400">Languages:</span>
                                                        {tutorData.languages.slice(0, 4).map((lang) => (
                                                            <span
                                                                key={lang}
                                                                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                                                            >
                                                                {lang}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOwner ? (
                                            <>
                                                <button
                                                    onClick={() => router.push('/user/settings')}
                                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Edit size={16} />
                                                    <span>Edit Profile</span>
                                                </button>
                                                <button
                                                    onClick={handleShareProfile}
                                                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 relative group"
                                                >
                                                    <Copy size={16} />
                                                    <span>{copied ? 'Copied!' : 'Share Profile'}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                                    <span className="w-4 h-6 border-2 border-purple-300 border-t-0 border-r-0 rotate-[-45deg] translate-y-[-2px]"></span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#A855F7" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                            {tutorData.bio}
                        </p>

                        {tutorData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {tutorData.tags.map((tag, i) => (
                                    <span
                                        key={`${tag}-${i}`}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-[#18181b]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{tutorData.stats.experience} of experience</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MonitorPlay className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{tutorData.stats.courses} courses</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{tutorData.stats.students} students</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{tutorData.stats.lessons} lessons conducted</span>
                            </div>
                        </div>
                    </div>

                    {detailItems.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile details</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {detailItems.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-gray-100 p-4">
                                        <div className="text-xs uppercase tracking-wide text-gray-400">
                                            {item.label}
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-gray-900">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {availability.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Availability</h2>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarIcon className="w-4 h-4" />
                                    Local time
                                </div>
                            </div>
                            <div className="space-y-4">
                                {availability.map((slot) => (
                                    <div key={slot.day} className="rounded-2xl border border-gray-100 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-gray-900">{slot.day}</span>
                                            <span className="text-xs text-gray-500">
                                                {slot.slots.length ? `${slot.slots.length} slots` : 'No slots listed'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {slot.slots.length > 0 ? (
                                                slot.slots.map((time) => (
                                                    <span
                                                        key={`${slot.day}-${time}`}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                                                    >
                                                        {time}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">Contact to confirm times.</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tutorData.reviewsCount > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                                <span className="text-sm text-gray-500">{tutorData.reviewsCount} reviews</span>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                                <div className="text-3xl font-bold text-gray-900">
                                    {tutorData.rating ? tutorData.rating.toFixed(1) : 'New'}
                                </div>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={`rating-${index}`}
                                            className={`w-4 h-4 ${index < Math.round(tutorData.rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Based on {tutorData.reviewsCount} reviews
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500 font-medium">Hourly rate</span>
                            <div className="text-right">
                                {typeof tutorData.price === 'number' && tutorData.price > 0 ? (
                                    <>
                                        <span className="text-3xl font-bold text-gray-900">
                                            {formatAmount(tutorData.price)}
                                        </span>
                                        <span className="text-sm text-gray-500">/hr</span>
                                    </>
                                ) : (
                                    <span className="text-lg font-semibold text-gray-700">Contact for pricing</span>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <button
                                onClick={() => params?.id && router.push(`/user/assignments/request-proposal/${params.id}`)}
                                disabled={!canRequestProposal}
                                className="w-full bg-[#C084FC] hover:bg-[#A855F7] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                Request proposal
                            </button>
                            <button
                                className="w-full bg-white text-gray-500 font-bold py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-colors opacity-70 cursor-not-allowed"
                                disabled
                            >
                                <MessageSquare className="w-5 h-5" />
                                Send message
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                {canRequestProposal
                                    ? "Submit an assignment request to receive a proposal."
                                    : "Tutors cannot request proposals from other tutors."}
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            {tutorData.booked_stats && (
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    {tutorData.booked_stats}
                                </div>
                            )}
                            {tutorData.response_time && (
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    {tutorData.response_time} response time
                                </div>
                            )}
                            {tutorData.location && (
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    {tutorData.location}
                                </div>
                            )}
                            {tutorData.languages.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    <div className="mb-2 font-medium text-gray-400">Languages</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tutorData.languages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
                                            >
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TutorProfileContent
