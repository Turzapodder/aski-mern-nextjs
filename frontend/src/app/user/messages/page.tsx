import React, { Suspense } from 'react';
import { MessagesClient } from './MessagesClient';

export const metadata = {
  title: "Messages | Aski",
  description: "Chat with your tutors and clients",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] md:h-[calc(100vh-64px)] bg-[#f5f6f8]" />}>
      <MessagesClient />
    </Suspense>
  );
}
