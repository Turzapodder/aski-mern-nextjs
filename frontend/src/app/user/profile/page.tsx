'use client'
import { useGetUserQuery } from "@/lib/services/auth";
import { useEffect, useMemo, useState } from "react";
import { useGetProfileQuery } from "@/lib/services/profile";
import ProfileEditor from "@/components/ProfileEditor";

const Profile = () => {
  const { data: userData, isSuccess } = useGetUserQuery();
  const user = userData?.user;
  const userId = user?._id || user?.id;
  const role: any = useMemo(() => {
    const roles: string[] = user?.roles || [];
    if (roles.includes('tutor')) return 'tutor';
    if (roles.includes('student')) return 'student';
    return 'user';
  }, [user]);

  const { data: profileData } = useGetProfileQuery(userId!, {
    skip: !userId,
  });

  if (!isSuccess || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 overflow-auto">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>
        <ProfileEditor userId={userId} role={role} initialProfile={profileData?.user || profileData} />
      </div>
    </div>
  );
}

export default Profile