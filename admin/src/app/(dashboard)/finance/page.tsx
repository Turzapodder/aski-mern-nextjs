import React from 'react';
import { AdminFinanceClient } from '@/features/finance/components/AdminFinanceClient';

export const metadata = {
  title: 'Finance & Transactions | Admin | Aski',
  description: 'Monitor platform revenue and transactions',
};

export default function AdminFinancePage() {
  return <AdminFinanceClient />;
}
