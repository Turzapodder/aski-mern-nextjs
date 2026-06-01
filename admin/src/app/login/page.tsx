import React, { Suspense } from 'react';
import AdminLoginClient from '@/features/auth/components/AdminLoginClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Login | Aski Admin',
  description: 'Sign in to Aski Administration Panel',
};

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginClient />
    </Suspense>
  );
}
