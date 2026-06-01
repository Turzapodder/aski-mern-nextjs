import React from 'react';
import { AdminAssignmentDetailsClient } from '@/features/assignments/components/AdminAssignmentDetailsClient';

export const metadata = {
  title: 'Assignment Details | Admin | Aski',
  description: 'Assignment detail view and moderation controls',
};

export default function AdminAssignmentDetailsPage() {
  return <AdminAssignmentDetailsClient />;
}
