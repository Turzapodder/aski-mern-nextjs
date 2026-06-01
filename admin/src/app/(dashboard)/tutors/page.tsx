import React from 'react';
import { AdminTutorsClient } from '@/features/tutors/components/AdminTutorsClient';

export const metadata = {
  title: 'Tutors | Admin | Aski',
  description: 'Monitor verified tutors and manage account status',
};

export default function AdminTutorsPage() {
  return <AdminTutorsClient />;
}
