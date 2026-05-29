'use client';

import React from 'react';
import Image from 'next/image';
import {
  Star,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  MonitorPlay,
  Clock,
  Calendar as CalendarIcon,
  Award,
  Zap,
  User,
  GraduationCap,
  MapPin,
  Edit,
  Bookmark,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReportModal from '@/components/ReportModal';
import { toast } from 'sonner';
import { useTutorProfileLogic } from './useTutorProfileLogic';

export const TutorProfileClient = () => {
  const {
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
    detailItems,
    isBookmarked,
    handleToggleBookmark,
    handleSendMessage,
    isCreatingChat,
    viewer,
  } = useTutorProfileLogic();

  // Booking appointment states
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = React.useState<string>('');
  const [slots, setSlots] = React.useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<any | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<any[]>([]);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(60);
  const [isBooking, setIsBooking] = React.useState(false);

  // Fetch slot availability when selectedDate shifts
  React.useEffect(() => {
    if (!selectedDate || !tutor?._id) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setSelectedSlots([]);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(
          `${baseUrl}/api/tutors/profile/${tutor._id}/slots?date=${selectedDate}`
        );
        if (!response.ok) throw new Error('Failed to load slots');
        const data = await response.json();
        if (data.status === 'success' || data.success === true) {
          const slotsArray = data.slots || data.data || [];
          const mappedSlots = slotsArray.map((item: any) => ({
            ...item,
            available: item.available !== undefined ? item.available : !item.isBooked
          }));
          setSlots(mappedSlots);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchSlots();
  }, [selectedDate, tutor?._id]);

  const handleOpenBooking = () => {
    if (!viewer) {
      router.push('/login');
      return;
    }
    if (isOwner) {
      toast.error('You cannot book your own sessions.');
      return;
    }
    if (viewer.roles?.includes('tutor')) {
      toast.error('Only students can book tutor appointments.');
      return;
    }
    setBookingOpen(true);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days: Array<{ day: number; disabled: boolean; dateString: string; isToday: boolean }> = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: 0, disabled: true, dateString: '', isToday: false });
    }
    
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(currentYear, currentMonth, d);
      
      const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = WEEKDAY_NAMES[dayDate.getDay()];
      const isWorkingDay = tutor?.tutorProfile?.availableDays?.includes(dayName);
      
      const isVacationStr = tutor?.tutorProfile?.offdays?.includes(dateStr);
      const isPast = dayDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
      const disabled = !isWorkingDay || isVacationStr || isPast;
      
      days.push({
        day: d,
        disabled,
        dateString: dateStr,
        isToday: dateStr === todayString
      });
    }
    
    return days;
  };

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
    );
  }

  if (error || !tutorData) {
    return (
      <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
        <div className="text-sm text-gray-600">{error || 'Tutor not found'}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-5 mb-6">
              <div className="relative shrink-0">
                <div className="w-22 h-22 rounded-2xl overflow-hidden relative">
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

              <div className="grow">
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
                      <span className="text-xs text-gray-500 underline decoration-gray-300">
                        based on {tutorData.reviewsCount} reviews
                      </span>
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
                    <button
                      onClick={handleToggleBookmark}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isBookmarked ? 'bg-amber-50 text-amber-600' : 'bg-purple-50'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-[15px] leading-relaxed mb-6">{tutorData.bio}</p>

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
                <span className="text-sm font-medium">
                  {tutorData.stats.experience} of experience
                </span>
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
                <span className="text-sm font-medium">
                  {tutorData.stats.lessons} lessons conducted
                </span>
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
                    <div className="mt-1 text-sm font-semibold text-gray-900">{item.value}</div>
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
                      className={`w-4 h-4 ${
                        index < Math.round(tutorData.rating)
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

            {viewer?._id !== tutor?._id && (
              <div className="grid gap-3">
                <button
                  onClick={handleOpenBooking}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-100"
                >
                  <CalendarIcon className="w-5 h-5" />
                  Book Live Session
                </button>

                <button
                  onClick={() =>
                    tutor?._id && router.push(`/user/assignments/request-proposal/${tutor._id}`)
                  }
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
                    ? 'Submit an assignment request to receive a proposal.'
                    : 'Tutors cannot request proposals from other tutors.'}
                </p>
              </div>
            )}

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

      {/* Premium Booking Calendar Checkout Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col relative animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Book Live Session</h3>
                <p className="text-sm text-gray-500">Pick a day and select your preferred slot</p>
              </div>
              <button 
                onClick={() => {
                  setBookingOpen(false);
                  setSelectedDate('');
                  setSelectedSlot(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 p-6 gap-6">
              
              {/* Left Column: Calendar Datepicker */}
              <div className="lg:col-span-5 pr-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">
                    {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                    >
                      &lt;
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <span key={day} className="text-xs font-bold text-gray-400 py-1">{day}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((item, index) => {
                    if (item.day === 0) {
                      return <div key={`empty-${index}`} />;
                    }

                    const isSelected = selectedDate === item.dateString;
                    return (
                      <button
                        key={item.dateString}
                        disabled={item.disabled}
                        onClick={() => setSelectedDate(item.dateString)}
                        className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                            : item.disabled
                            ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed line-through'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                      >
                        {item.day}
                        {item.isToday && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-600"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>Working Weekday</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 bg-gray-100 border border-gray-200 rounded-sm"></span>
                    <span>Vacation / Holiday / Weekend (Blocked)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Time Slots & Checkout */}
              <div className="lg:col-span-7 lg:pl-6 pt-6 lg:pt-0 flex flex-col justify-between">
                <div>
                  
                  {/* Slot chips */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">
                      {selectedDate ? `Available slots for ${new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}` : 'Select a date to view available time slots'}
                    </h4>

                    {!selectedDate ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CalendarIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">Please pick a day on the calendar</span>
                      </div>
                    ) : loadingSlots ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 rounded-xl" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold">
                        ⚠️ No slots are available on this date. Tutors can be booked on their off-days or vacation periods. Please select another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((item) => {
                          const isSlotSelected = selectedSlots.some((s) => s.slot === item.slot);
                          return (
                            <button
                              key={item.slot}
                              disabled={!item.available}
                              onClick={() => {
                                if (isSlotSelected) {
                                  setSelectedSlots((prev) => prev.filter((s) => s.slot !== item.slot));
                                } else {
                                  setSelectedSlots((prev) => [...prev, item]);
                                  setSelectedSlot(item);
                                }
                              }}
                              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                                isSlotSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                                  : !item.available
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                              }`}
                            >
                              {item.slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pricing Toggles */}
                  {selectedSlots.length > 0 && (
                    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {selectedSlots.length === 1 ? (
                        <>
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Choose Session Duration</h4>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {/* 30 Mins slot option */}
                            {(tutor?.tutorProfile?.allowedSessionDurations || [30, 60]).includes(30) && (
                              <button
                                onClick={() => setSelectedDuration(30)}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                  selectedDuration === 30
                                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                                    : 'border-gray-200 hover:border-purple-200'
                                }`}
                              >
                                <span className="block text-xs font-bold text-gray-400 uppercase">30 Minutes</span>
                                <span className="block text-lg font-bold text-gray-900 mt-1">
                                  {formatAmount(tutor?.tutorProfile?.halfHourlyRate || Math.round((tutor?.tutorProfile?.hourlyRate || 0) * 0.6))}
                                </span>
                                <span className="block text-[10px] text-gray-400 mt-1">Single slot session</span>
                              </button>
                            )}

                            {/* 60 Mins slot option */}
                            {(tutor?.tutorProfile?.allowedSessionDurations || [30, 60]).includes(60) && (
                              <button
                                onClick={() => setSelectedDuration(60)}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                  selectedDuration === 60
                                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                                    : 'border-gray-200 hover:border-purple-200'
                                }`}
                              >
                                <span className="block text-xs font-bold text-gray-400 uppercase">1 Hour (60 Mins)</span>
                                <span className="block text-lg font-bold text-gray-900 mt-1">
                                  {formatAmount(tutor?.tutorProfile?.hourlyRate || 0)}
                                </span>
                                <span className="block text-[10px] text-gray-400 mt-1">Full hourly appointment</span>
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="mb-4 p-4 rounded-2xl bg-purple-50/30 border border-purple-100">
                          <span className="block text-xs font-bold text-purple-700 uppercase tracking-wide">Multi-hour booking active</span>
                          <span className="block text-[11px] text-gray-500 mt-1">
                            You are booking {selectedSlots.length} hours of live session time slots.
                          </span>
                        </div>
                      )}

                      {/* Receipt Card */}
                      <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/30 space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Session billing:</span>
                          <span className="font-semibold text-gray-700">
                            {selectedSlots.length > 1 ? `${selectedSlots.length} hours` : `${selectedDuration} mins`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Platform & booking fee:</span>
                          <span className="font-semibold text-gray-700">Free (0%)</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                          <span>Total booking price:</span>
                          <span className="text-purple-600">
                            {formatAmount(
                              selectedSlots.length > 1
                                ? selectedSlots.reduce((sum, item) => sum + (item.price || tutor?.tutorProfile?.hourlyRate || 0), 0)
                                : selectedDuration === 30
                                ? (tutor?.tutorProfile?.halfHourlyRate || Math.round((tutor?.tutorProfile?.hourlyRate || 0) * 0.6))
                                : (tutor?.tutorProfile?.hourlyRate || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Checkout & Direct Payment */}
                {selectedSlots.length > 0 && (
                  <div className="mt-auto pt-6 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Direct Gateway Banner */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80 flex items-center justify-between">
                      <div>
                        <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Payment Method</span>
                        <span className="block text-sm font-extrabold text-purple-700 mt-1">
                          💳 Direct Checkout (UddoktaPay MFS/Card)
                        </span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wide">
                        Secure Gateway
                      </span>
                    </div>

                    {/* Book Button */}
                    <div>
                      <button
                        onClick={async () => {
                          if (!selectedDate || selectedSlots.length === 0) return;
                          setIsBooking(true);
                          try {
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                            
                            // Book each slot sequentially
                            let successCount = 0;
                            
                            for (const item of selectedSlots) {
                              const res = await fetch(`${baseUrl}/api/sessions/book`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  tutorId: tutor?._id,
                                  date: selectedDate,
                                  slot: item.slot,
                                  duration: selectedSlots.length > 1 ? 60 : selectedDuration,
                                  subject: '1:1 Live Mentorship Session',
                                }),
                                credentials: 'include',
                              });
                              const data = await res.json();
                              if (res.ok && (data.status === 'success' || data.success === true)) {
                                successCount++;
                              }
                            }

                            if (successCount === selectedSlots.length) {
                              toast.success(
                                selectedSlots.length > 1
                                  ? `Successfully booked ${successCount} session slots! Direct checkout complete.`
                                  : 'Appointment booked successfully! Direct checkout complete.'
                              );
                              setBookingOpen(false);
                              setTimeout(() => {
                                router.push('/user/messages');
                              }, 1500);
                            } else if (successCount > 0) {
                              toast.success(`Successfully booked ${successCount} of ${selectedSlots.length} slots. Direct checkout complete.`);
                              setBookingOpen(false);
                              setTimeout(() => {
                                router.push('/user/messages');
                              }, 1500);
                            } else {
                              toast.error('Failed to complete direct checkout booking. Please try again.');
                            }
                          } catch (err: any) {
                            console.error(err);
                            toast.error('An unexpected error occurred. Please try again.');
                          } finally {
                            setIsBooking(false);
                          }
                        }}
                        disabled={isBooking}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {isBooking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Processing Checkout Booking...</span>
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="w-5 h-5" />
                            <span>Proceed to Payment & Book ({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
