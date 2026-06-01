import React from 'react';
import { AdminFinanceAnalyticsClient } from '@/features/finance/components/AdminFinanceAnalyticsClient';

export const metadata = {
  title: 'Finance Analytics | Admin | Aski',
  description: 'Monitor platform revenue and transactions',
};

export default function FinanceAnalyticsPage() {
  return <AdminFinanceAnalyticsClient />;
}
