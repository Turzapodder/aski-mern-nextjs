"use client"

import React from 'react'
import Image from 'next/image'
import { Star, CheckCircle, ShieldCheck, MessageSquare, MonitorPlay, Clock, Calendar as CalendarIcon, Award, Zap, User, GraduationCap, MapPin, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ReportModal from '@/components/ReportModal'
import { useTutorProfileLogic } from './useTutorProfileLogic'

export const TutorProfileClient = () => {
    const {
        router,
        tutor,
        loading,
        error,
        reportOpen,
        setReportOpen,
        formatAmount,
        reporterType,
        canReportTutor,
        canRequestProposal,
        isOwner,
        tutorData,
        availability,
        detailItems,
        handleSendMessage,
        isCreatingChat
    } = useTutorProfileLogic();

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
                                        {isOwner && (
                                            <button
                                                onClick={() => router.push('/user/settings')}
                                                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Edit profile
                                            </button>
                                        )}
                                        {canReportTutor && tutor?._id && (
                                            <button
                                                onClick={() => setReportOpen(true)}
                                                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                                            >
                                                Report profile
                                            </button>
                                        )}
                                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                                <span className="w-4 h-6 border-2 border-purple-300 border-t-0 border-r-0 rotate-[-45deg] translate-y-[-2px]"></span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#A855F7" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                            </div>
                                        </button>
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
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6">
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
                                onClick={() => tutor?._id && router.push(`/user/assignments/request-proposal/${tutor._id}`)}
                                disabled={!canRequestProposal}
                                className="w-full bg-[#C084FC] hover:bg-[#A855F7] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                Request proposal
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={isCreatingChat}
                                className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <MessageSquare className="w-5 h-5 text-purple-500" />
                                {isCreatingChat ? 'Starting chat...' : 'Send message'}
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
                                        {tutorData.languages.map((lang: string) => (
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

            {canReportTutor && tutor?._id && (
                <ReportModal
                    isOpen={reportOpen}
                    onClose={() => setReportOpen(false)}
                    reporterType={reporterType}
                    reportedType="tutorProfile"
                    reportedId={tutor._id}
                />
            )}
        </div>
    )
}
