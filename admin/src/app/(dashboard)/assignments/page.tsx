import React from 'react';
import { AdminAssignmentsClient } from '@/features/assignments/components/AdminAssignmentsClient';

export const metadata = {
  title: 'Assignments | Admin | Aski',
  description: 'Manage global assignments',
};

export default function AdminAssignmentsPage() {
  return <AdminAssignmentsClient />;
}
