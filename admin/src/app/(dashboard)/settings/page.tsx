import React from 'react';
import { AdminSettingsClient } from '@/features/settings/components/AdminSettingsClient';

export const metadata = {
  title: 'Settings | Admin | Aski',
  description: 'Configure platform operational settings',
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
