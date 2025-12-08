'use client'
import React, { useEffect } from 'react'
import DashboardNavbar from './DashboardNavbar'
import { useGetUserQuery } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: userData, isLoading } = useGetUserQuery();
  const router = useRouter();

  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      if (user.roles.includes('tutor') && user.onboardingStatus !== 'completed') {
        router.push('/account/tutor-onboarding');
      }
    }
  }, [userData, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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