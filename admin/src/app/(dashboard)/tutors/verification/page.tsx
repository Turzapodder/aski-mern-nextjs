import React from 'react';
import { AdminTutorVerificationClient } from '@/features/tutors/components/AdminTutorVerificationClient';

export const metadata = {
  title: 'Tutor Verification | Admin | Aski',
  description: 'Review pending applications and approve qualified tutors',
};

export default function TutorVerificationPage() {
  return <AdminTutorVerificationClient />;
}
