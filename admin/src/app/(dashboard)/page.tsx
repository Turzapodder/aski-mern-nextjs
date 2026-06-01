import React from 'react';
import { AdminDashboardClient } from '@/features/dashboard/components/AdminDashboardClient';

export const metadata = {
  title: 'Dashboard | Aski Admin',
  description: 'Aski Administration Dashboard',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
