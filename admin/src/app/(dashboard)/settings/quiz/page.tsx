import React from 'react';
import { AdminQuizClient } from '@/features/settings/components/AdminQuizClient';

export const metadata = {
  title: 'Quiz Management | Admin | Aski',
  description: 'Manage onboarding assessment questions',
};

export default function QuizManagementPage() {
  return <AdminQuizClient />;
}
