'use client'
import React, { useEffect } from 'react'
import DashboardNavbar from './DashboardNavbar'
import { useGetUserQuery } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: userData, isLoading } = useGetUserQuery();
  const router = useRouter();

  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      if (user.roles.includes('admin')) {
        router.replace('/admin');
        return;
      }
      if (
        user.roles.includes('tutor') &&
        user.onboardingStatus !== 'completed' &&
        user.onboardingStatus !== 'approved'
      ) {
        router.replace('/account/tutor-onboarding');
      }
    }
  }, [userData, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-28" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-6 w-52" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto">
      <DashboardNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
