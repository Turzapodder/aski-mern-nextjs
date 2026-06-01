import React from 'react';
import { AdminReportsClient } from '@/features/content-reports/components/AdminReportsClient';

export const metadata = {
  title: 'Reports | Admin | Aski',
  description: 'Manage content reports',
};

export default function AdminReportsPage() {
  return <AdminReportsClient />;
}
