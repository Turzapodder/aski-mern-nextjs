'use client'
import { useGetUserQuery } from "@/lib/services/auth";
import {  useMemo, } from "react";
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
    <div className="min-h-screen gray-bg overflow-auto">
      <div className="w-full mx-auto">
        <ProfileEditor userId={userId} role={role} />
      </div>
    </div>
  );
}

export default Profile