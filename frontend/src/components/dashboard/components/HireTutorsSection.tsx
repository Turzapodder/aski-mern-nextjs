'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, GraduationCap, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function HireTutorsSection() {
  const router = useRouter();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopTutors = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/tutors?sortBy=rating&sortOrder=desc`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTutors(data.data.slice(0, 3)); // Display top 3 featured tutors
        }
      } catch (err) {
        console.error('Error fetching top tutors for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopTutors();
  }, []);

  // Helper to get initials and HSL gradient color for fallback avatars
  const getAvatarFallback = (name: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const hue = charCodeSum % 360;
    return {
      initials,
      style: {
        background: `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 40) % 360}, 80%, 50%))`,
      },
    };
  };

  if (loading) {
    return (
      <div className="mb-12 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-16 bg-gray-50 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tutors.length === 0) {
    return null; // Silent if no tutors found
  }

  return (
    <div className="mb-12 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Featured Tutors & Experts
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
              Top Rated
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Book 1:1 live guidance sessions or hire top-tier experts to resolve assignments instantly.
          </p>
        </div>
        <button
          onClick={() => router.push('/user/tutors')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors group"
        >
          View All Tutors
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Featured Tutors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tutors.map((tutor) => {
          const rating = tutor.publicStats?.averageRating || 5.0;
          const reviews = tutor.publicStats?.totalReviews || 0;
          const fallback = getAvatarFallback(tutor.name);

          // Get primary subject
          const subject = tutor.subjects?.[0] || tutor.skills?.[0] || 'Academic Mentor';

          return (
            <div
              key={tutor.id || tutor._id}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Header Info */}
              <div className="flex gap-4 items-start mb-4">
                {tutor.avatar ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image
                      src={tutor.avatar}
                      alt={tutor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    style={fallback.style}
                    className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-inner"
                  >
                    {fallback.initials}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[15px] text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                      {tutor.name}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-purple-500 fill-purple-500 stroke-white shrink-0" />
                  </div>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 mt-1">
                    {subject}
                  </span>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 grow">
                {tutor.bio || "High-performing subject matter expert ready to guide you through complex coursework, tasks, and assignments."}
              </p>

              {/* Stats & Price Row */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({reviews})</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Tutor Rating</span>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-gray-900">
                    {tutor.hourlyRate || 400} BDT
                    <span className="text-[10px] text-gray-400 font-normal">/hr</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Starting Price</span>
                </div>
              </div>

              {/* Call to Action Booking Button */}
              <button
                onClick={() => router.push(`/user/tutors/tutor-profile/${tutor.id || tutor._id}`)}
                className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center gap-1.5 shadow-sm shadow-purple-100"
              >
                <GraduationCap className="w-4 h-4" />
                Book Session & View Profile
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
