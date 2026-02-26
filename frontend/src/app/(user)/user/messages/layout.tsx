import type { Metadata } from "next"
import { ChatProvider } from "@/contexts/ChatContext"

export const metadata: Metadata = { title: "Messages" }


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
