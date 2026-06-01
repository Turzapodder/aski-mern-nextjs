import React from 'react';
import { ResetPasswordConfirmClient } from '@/features/Authentication/components/ResetPasswordConfirmClient';

export const metadata = {
  title: 'Set new password | Aski',
  description: 'Set a new password',
};

export default function ResetPasswordConfirmPage() {
  return <ResetPasswordConfirmClient />;
}
