"use client"
import Image from "next/image"
import { ChatMessageBubble } from "./ChatMessageBubble"

interface ChatMessageListProps {
    messages: any[]
    currentUserId: string | null
    isStudent: boolean
    messagesLoading: boolean
    messagesError: any
    typingList: any[]
    editingMessageId: string | null
    editingContent: string
    offerActionId: string | null
    resolveFileUrl: (url?: string) => string
    messagesEndRef: React.RefObject<HTMLDivElement | null>
    onEdit: (msg: any) => void
    onCancelEdit: () => void
    onSaveEdit: () => void
    onEditChange: (content: string) => void
    onConfirmDelete: (msg: any) => void
    onOfferDecision: (offerId: string, action: "accept" | "decline") => void
}

export function ChatMessageList({
    messages,
    currentUserId,
    isStudent,
    messagesLoading,
    messagesError,
    typingList,
    editingMessageId,
    editingContent,
    offerActionId,
    resolveFileUrl,
    messagesEndRef,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onEditChange,
    onConfirmDelete,
    onOfferDecision,
}: ChatMessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Loading skeleton */}
            {messagesLoading && (
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-24 rounded bg-gray-100" />
                                <div className="h-4 w-full rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {!messagesLoading && Boolean(messagesError) && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Unable to load messages. Please try again.
                </div>
            )}

            {/* Empty state */}
            {!messagesLoading && !Boolean(messagesError) && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
                    <p className="font-semibold text-gray-700">No messages yet</p>
                    <p className="mt-1">Start the conversation and your messages will appear here.</p>
                </div>
            )}

            {/* Message bubbles */}
            {!messagesLoading &&
                !Boolean(messagesError) &&
                messages.map((msg, index) => {
                    const sender =
                        typeof msg.sender === "object" && msg.sender
                            ? msg.sender
                            : { _id: msg.sender as string, name: "Unknown", avatar: undefined }
                    const senderId = sender?._id
                    const isMe = senderId === currentUserId
                    const prevSender = messages[index - 1]?.sender
                    const prevSenderId =
                        typeof prevSender === "object" && prevSender
                            ? prevSender?._id
                            : (prevSender as string | undefined)
                    const showAvatar = !isMe && (index === 0 || prevSenderId !== senderId)

                    return (
                        <div key={msg._id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            {!isMe && (
                                <div className="w-10 h-10 flex-shrink-0">
                                    {showAvatar ? (
                                        sender.avatar ? (
                                            <Image
                                                src={sender.avatar}
                                                alt={sender.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                                {(sender.name || "U").charAt(0)}
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-10" />
                                    )}
                                </div>
                            )}

                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}>
                                {!isMe && showAvatar && (
                                    <span className="text-sm font-medium text-gray-500 mb-1 ml-1">
                                        {sender.name || "Unknown"}
                                    </span>
                                )}
                                <ChatMessageBubble
                                    msg={msg}
                                    currentUserId={currentUserId}
                                    isStudent={isStudent}
                                    editingMessageId={editingMessageId}
                                    editingContent={editingContent}
                                    offerActionId={offerActionId}
                                    resolveFileUrl={resolveFileUrl}
                                    onEdit={onEdit}
                                    onCancelEdit={onCancelEdit}
                                    onSaveEdit={onSaveEdit}
                                    onEditChange={onEditChange}
                                    onConfirmDelete={onConfirmDelete}
                                    onOfferDecision={onOfferDecision}
                                />
                            </div>
                        </div>
                    )
                })}

            {/* Typing indicator */}
            {typingList.length > 0 && (
                <div className="text-xs text-gray-500">
                    {typingList[0]?.name || "Someone"} is typing...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}
