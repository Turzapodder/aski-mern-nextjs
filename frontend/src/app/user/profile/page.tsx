import React, { Suspense } from 'react'
import { ProfileClient } from './ProfileClient';

export const metadata = {
  title: "Profile | Aski",
  description: "View and edit your profile",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <ProfileClient />
    </Suspense>
  );
}
