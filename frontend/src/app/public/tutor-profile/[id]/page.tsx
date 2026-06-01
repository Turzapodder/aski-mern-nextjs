import React from 'react';
import { PublicTutorProfileClient } from '@/features/TutorProfile/components/PublicTutorProfileClient';

export const metadata = {
  title: 'Public Tutor Profile | Aski',
  description: 'View tutor details',
};

export default function PublicTutorProfilePage() {
  return <PublicTutorProfileClient />;
}
