import React from 'react';
import { AdminUserDetailsClient } from '@/features/users/components/AdminUserDetailsClient';

export const metadata = {
  title: 'User Details | Admin | Aski',
  description: 'View user details and activity',
};

export default function AdminUserDetailsPage() {
  return <AdminUserDetailsClient />;
}
