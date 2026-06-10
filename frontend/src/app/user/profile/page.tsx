import React, { Suspense } from 'react';
import { SettingsClient } from '@/features/Settings/components/SettingsClient';

export const metadata = {
  title: 'Profile | Aski',
  description: 'View and edit your profile',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <SettingsClient />
    </Suspense>
  );
}
