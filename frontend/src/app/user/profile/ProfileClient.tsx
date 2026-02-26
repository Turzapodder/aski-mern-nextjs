"use client"

import React from 'react'
import ProfileEditor from "@/components/ProfileEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileLogic } from './useProfileLogic';

export const ProfileClient = () => {
  const {
    isSuccess,
    userId,
    role
  } = useProfileLogic();

  if (!isSuccess || !userId) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gray-bg">
      <div className="w-full mx-auto">
        <ProfileEditor userId={userId} role={role} />
      </div>
    </div>
  );
}
