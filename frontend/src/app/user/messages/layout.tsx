'use client';
import { ChatProvider } from "@/contexts/ChatContext";

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ChatProvider>
            {children}
        </ChatProvider>
    );
}
