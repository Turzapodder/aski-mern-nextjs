"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserQuery } from "@/lib/services/auth";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

export default function TutorProfilePage() {
  const { data, isLoading } = useGetUserQuery();
  const user = data?.user;
  const currency = user?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);

  const availability = useMemo<AvailabilitySlot[]>(() => {
    const days = user?.tutorProfile?.availableDays || [];
    const timeSlots = user?.tutorProfile?.availableTimeSlots || [];
    const slotsByDay = new Map<string, string[]>();

    timeSlots.forEach((entry: any) => {
      const day = typeof entry?.day === "string" ? entry.day : "";
      const slots = Array.isArray(entry?.slots) ? entry.slots.filter(Boolean) : [];
      if (day) {
        slotsByDay.set(day, slots);
      }
    });

    days.forEach((day: string) => {
      if (!slotsByDay.has(day)) {
        slotsByDay.set(day, []);
      }
    });

    return Array.from(slotsByDay.entries()).map(([day, slots]) => ({
      day,
      slots,
    }));
  }, [user]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !user.roles?.includes("tutor")) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-gray-500">Tutor profile is not available.</p>
      </div>
    );
  }

  const tutorProfile = user.tutorProfile || {};
  const expertise = tutorProfile.expertiseSubjects || [];
  const skills = tutorProfile.skills || [];
  const tags = Array.from(new Set([...expertise, ...skills]));
  const location = [user.city, user.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={user.profileImage || "/assets/tutor-profile.svg"}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {tutorProfile.verificationStatus && (
                <Badge variant="outline">{tutorProfile.verificationStatus}</Badge>
              )}
            </div>
            <p className="text-gray-600">
              {tutorProfile.professionalTitle || "Tutor"}
            </p>
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {location}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {typeof tutorProfile.hourlyRate === "number" && tutorProfile.hourlyRate > 0 ? (
              <>
                <div className="text-sm text-gray-500">Hourly rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatAmount(tutorProfile.hourlyRate ?? 0)}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Hourly rate not set</div>
            )}
            <Link
              href="/user/settings"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Edit profile
            </Link>
          </div>
        </div>

        {(tutorProfile.bio || user.about) && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {tutorProfile.bio || user.about}
            </p>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {availability.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-4 w-4" />
                Local time
              </div>
            </div>
            <div className="space-y-3">
              {availability.map((slot) => (
                <div key={slot.day} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{slot.day}</span>
                    <span className="text-xs text-gray-500">
                      {slot.slots.length ? `${slot.slots.length} slots` : "No slots listed"}
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
                      <div className="text-xs text-gray-400">Update your schedule to show available times.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {tutorProfile.qualification && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">Qualification</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{tutorProfile.qualification}</div>
            </div>
          )}
          {tutorProfile.currentInstitution && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">Institution</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{tutorProfile.currentInstitution}</div>
            </div>
          )}
          {tutorProfile.teachingMode && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">Teaching mode</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{tutorProfile.teachingMode}</div>
            </div>
          )}
          {typeof tutorProfile.experienceYears === "number" && (
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">Experience</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {tutorProfile.experienceYears}+ years
              </div>
            </div>
          )}
          {tutorProfile.achievements && (
            <div className="rounded-xl border border-gray-100 p-4 sm:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-400">Achievements</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{tutorProfile.achievements}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          Keep your profile updated to attract more students.
        </div>
      </div>
    </div>
  );
}
