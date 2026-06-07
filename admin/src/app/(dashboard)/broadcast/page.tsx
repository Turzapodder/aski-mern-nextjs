import { AdminBroadcastClient } from '@/features/broadcast/components/AdminBroadcastClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Broadcast | Aski Admin',
  description: 'Send system-wide broadcast notifications to users',
};

export default function BroadcastPage() {
  return <AdminBroadcastClient />;
}
