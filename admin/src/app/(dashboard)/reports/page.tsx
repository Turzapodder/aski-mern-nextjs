import React from 'react';
import { AdminDisputesClient } from '@/features/reports/components/AdminDisputesClient';

export const metadata = {
  title: 'Disputes | Admin | Aski',
  description: 'Investigate and resolve disputed assignments',
};

export default function AdminDisputesPage() {
  return <AdminDisputesClient />;
}
