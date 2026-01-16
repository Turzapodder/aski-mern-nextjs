'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Star, CheckCircle, ShieldCheck, MessageSquare, MonitorPlay, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Award, Zap, ChevronDown, User, GraduationCap } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

interface PublicTutor {
    _id: string
    name: string
    profileImage?: string
    about?: string
    tutorProfile?: {
        bio?: string
        expertiseSubjects?: string[]
        skills?: string[]
        hourlyRate?: number
        experienceYears?: number
        verificationStatus?: string
    }
    publicStats?: {
        averageRating?: number
        totalReviews?: number
        totalProjects?: number
        completedProjects?: number
        responseTime?: number
    }
}

const TutorProfilePage = () => {
    const params = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState('about')
    const [selectedDate, setSelectedDate] = useState('Tue, 2 April, 2024')
    const [selectedTime, setSelectedTime] = useState<string | null>('13:30')
    const [tutor, setTutor] = useState<PublicTutor | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

        return {
            name: tutor.name,
            subject: subjects[0] ? `${subjects[0]} tutor` : 'Tutor',
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
            price: tutor.tutorProfile?.hourlyRate || 0,
            response_time: responseTime ? `${responseTime}-hour` : 'Flexible',
            booked_stats: completedProjects
                ? `${completedProjects} lessons completed`
                : 'New tutor',
            videoThumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop',
            profileImage: tutor.profileImage || '/assets/tutor-profile.svg'
        }
    }, [tutor])

    const scheduleSlots = [
        "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
        "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
        "19:00", "19:30", "20:00", "20:30"
    ]

    const reviews = [
        {
            id: 1,
            user: "Cynthia W.",
            role: "Student",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            rating: 5,
            comment: "Absolutely brilliant course, trust me! Jenny's deep knowledge of economics, coupled with her engaging teaching style, made every lesson a pleasure!",
            verified: true
        },
        {
            id: 2,
            user: "Brian B.",
            role: "Student",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
            rating: 5,
            comment: "Invaluable experience, tons of useful knowledge.",
            verified: true
        },
        {
            id: 3,
            user: "Juliet M.",
            role: "Student",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            rating: 5,
            comment: "I can't recommend this course enough! Jenny's passion for economics is contagious, and her ability to simplify complex concepts - just wow and wow!",
            verified: true
        }
    ]

    if (loading) {
        return (
            <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-56 w-full rounded-3xl" />
                        <Skeleton className="h-24 w-full rounded-3xl" />
                        <Skeleton className="h-72 w-full rounded-3xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-80 w-full rounded-3xl" />
                        <Skeleton className="h-72 w-full rounded-3xl" />
                    </div>
                </div>
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
                                    </div>
                                    <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                            <span className="w-4 h-6 border-2 border-purple-300 border-t-0 border-r-0 rotate-[-45deg] translate-y-[-2px]"></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#A855F7" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                            {tutorData.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {tutorData.tags.map((tag, i) => (
                                <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full text-white ${["Economics", "Financial Theory", "Management", "Politics", "Finance", "International Economy", "Business English", "Time Management", "Global Economy", "Oxford", "Microeconomics", "IELTS"].includes(tag) ? 'bg-[#18181b]' : 'bg-[#18181b]'
                                    }`}>
                                    {tag}
                                </span>
                            ))}
                        </div>

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

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center border-b border-gray-100 overflow-x-auto">
                            {['About me', 'Schedule', 'Courses (24)', 'Resume', 'Reviews (236)'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase().split(' ')[0]
                                            ? 'text-gray-900 border-b-2 border-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About me</h2>
                        <p className="text-gray-600 leading-relaxed text-[15px]">
                            Having graduated from Oxford University with a degree in Economics, I was fortunate to receive a rigorous education steeped in academic excellence and research-driven inquiry. I&apos;m not only equipped with a deep understanding of economic theory but also instilled in me a commitment to critical thinking and analytical rigor.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Schedule</h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-grow flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">i</div>
                                Pick time for first lesson. The timings are displayed in your local timezone.
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl min-w-max cursor-pointer">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">PST UTC-08:00</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
                            <div className="bg-[#18181b] text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                                    <span className="font-semibold">{selectedDate}</span>
                                    <button className="p-1 hover:bg-white/10 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                                <div className="flex bg-gray-800 rounded-lg p-1">
                                    <button className="px-4 py-1.5 bg-[#C084FC] text-white rounded-md text-sm font-semibold">Day</button>
                                    <button className="px-4 py-1.5 text-gray-400 hover:text-white rounded-md text-sm font-semibold transition-colors">Week</button>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                                {scheduleSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-3 rounded-[14px] text-sm font-semibold transition-all ${selectedTime === time
                                                ? 'bg-[#C084FC] text-white shadow-lg shadow-purple-200 scale-105'
                                                : 'bg-white border border-gray-100 text-gray-700 hover:border-purple-200 hover:bg-purple-50'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6">
                        <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video group cursor-pointer">
                            <Image
                                src={tutorData.videoThumbnail}
                                alt="Intro Video"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-purple-600 border-b-[8px] border-b-transparent"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <span className="text-gray-500 font-medium">Price per lesson</span>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-gray-900">${tutorData.price}</span>
                                <span className="text-sm text-gray-500">/hr</span>
                            </div>
                        </div>

                        <button className="w-full bg-[#C084FC] hover:bg-[#A855F7] text-white font-bold py-3.5 rounded-xl mb-3 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-100">
                            <Zap className="w-5 h-5 fill-white" />
                            Book trial lesson
                        </button>

                        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 mb-6 flex items-center justify-center gap-2 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Send message
                        </button>

                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                {tutorData.booked_stats}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Clock className="w-5 h-5 text-gray-400" />
                                {tutorData.response_time} response time
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                                <span className="text-gray-500 font-medium">({tutorData.reviewsCount})</span>
                            </div>
                            <button className="text-purple-600 text-sm font-bold hover:text-purple-700">View all</button>
                        </div>

                        <div className="flex items-start gap-6 mb-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#8B5CF6] mb-1">4.9</div>
                                <div className="flex justify-center gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium">{tutorData.reviewsCount} Reviews</div>
                            </div>
                            <div className="flex-grow space-y-2">
                                {[
                                    { label: 'Qualifications', val: '4.9' },
                                    { label: 'Expertise', val: '4.8' },
                                    { label: 'Communication', val: '5.0' },
                                    { label: 'Value for money', val: '4.9' }
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 w-24">{stat.label}</span>
                                        <div className="flex-grow mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(parseFloat(stat.val) / 5) * 100}%` }}></div>
                                        </div>
                                        <span className="font-bold text-gray-700">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                                <Image src={review.avatar} alt={review.user} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-sm text-gray-900">{review.user}</span>
                                                    {review.verified && <CheckCircle className="w-3.5 h-3.5 text-purple-600 fill-purple-600 stroke-white" />}
                                                </div>
                                                <div className="text-xs text-gray-400">{review.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 mb-2">Invaluable experience, tons of useful knowledge.</p>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    )

}

export default TutorProfilePage



