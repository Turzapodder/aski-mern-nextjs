import React, { Suspense } from 'react';
import { RegisterClient } from '@/features/Authentication/components/RegisterClient';

export const metadata = {
  title: 'Register | Aski',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterClient />
    </Suspense>
  );
}
