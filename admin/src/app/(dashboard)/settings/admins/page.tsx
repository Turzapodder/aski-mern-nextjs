import React from 'react';
import { AdminAccountsClient } from '@/features/settings/components/AdminAccountsClient';

export const metadata = {
  title: 'Admin Accounts | Aski',
  description: 'Manage admin access and permissions',
};

export default function AdminAccountsPage() {
  return <AdminAccountsClient />;
}
