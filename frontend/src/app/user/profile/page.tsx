'use client'
import { useGetUserQuery } from "@/lib/services/auth";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ProfileForm } from "@/components/ProfileForm";

interface User {
  name: string;
  email: string;
  is_verified: boolean;
  roles?: string[];
}

const Profile = () => {
  const [user, setUser] = useState<any>({ name: '', email: '', is_verified: false, roles: [] })
  const { data, isSuccess } = useGetUserQuery();
  const router = useRouter();
  
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user)
      // Redirect to dashboard if user role is 'user'
      // if (data.user.roles && data.user.roles.includes('user') && !data.user.roles.includes('tutor')) {
      //   router.push('/user/dashboard')
      // }
    }
  }, [data, isSuccess, router])

  // If user role is 'user' only, show loading while redirecting
  // if (user.roles && user.roles.includes('user') && !user.roles.includes('tutor')) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-gray-100">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Redirecting to dashboard...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_verified
                      ? "bg-primary-100 text-primary-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_verified ? "Verified" : "Not Verified"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 capitalize"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-lg text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}

export default Profile