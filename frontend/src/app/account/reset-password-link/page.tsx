import React from 'react';
import { ResetPasswordLinkClient } from '@/features/Authentication/components/ResetPasswordLinkClient';

export const metadata = {
  title: 'Reset Password | Aski',
  description: 'Reset your password',
};

export default function ResetPasswordLinkPage() {
  return <ResetPasswordLinkClient />;
}
