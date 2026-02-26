"use client"
import { BadgeDollarSign, Check, ChevronDown, Pencil, Trash2, X } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const MAX_MESSAGE_LENGTH = 1000

interface MessageBubbleProps {
    msg: any
    currentUserId: string | null
    isStudent: boolean
    editingMessageId: string | null
    editingContent: string
    offerActionId: string | null
    resolveFileUrl: (url?: string) => string
    onEdit: (msg: any) => void
    onCancelEdit: () => void
    onSaveEdit: () => void
    onEditChange: (content: string) => void
    onConfirmDelete: (msg: any) => void
    onOfferDecision: (offerId: string, action: "accept" | "decline") => void
}

export function ChatMessageBubble({
    msg,
    currentUserId,
    isStudent,
    editingMessageId,
    editingContent,
    offerActionId,
    resolveFileUrl,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onEditChange,
    onConfirmDelete,
    onOfferDecision,
}: MessageBubbleProps) {
    const sender =
        typeof msg.sender === "object" && msg.sender
            ? msg.sender
            : { _id: msg.sender as string, name: "Unknown", avatar: undefined }
    const senderId = sender?._id
    const isMe = senderId === currentUserId
    const isRead = isMe && msg.readBy?.some((entry: any) => entry.user !== currentUserId)
    const offerId = msg.meta?.offerId
    const canEdit = isMe && msg.type === "text" && !msg.isDeleted
    const canDelete = isMe && !msg.isDeleted
    const isEditing = editingMessageId === msg._id

    return (
        <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
            {msg.type === "offer" ? (
                <div
                    className={`rounded-2xl border ${isMe ? "border-primary-200 bg-primary-50" : "border-gray-200 bg-white"
                        } p-4 text-sm w-full`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-900">Custom Offer</div>
                        <span className="text-xs uppercase tracking-wide text-gray-500">
                            {msg.meta?.status || "pending"}
                        </span>
                    </div>
                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                            <span>Budget</span>
                            <span className="font-semibold">{msg.meta?.proposedBudget ?? 0}</span>
                        </div>
                        {msg.meta?.proposedDeadline && (
                            <div className="flex justify-between">
                                <span>Deadline</span>
                                <span className="font-semibold">
                                    {format(new Date(msg.meta.proposedDeadline), "MMM dd, yyyy")}
                                </span>
                            </div>
                        )}
                        {msg.meta?.message && <p className="text-sm text-gray-600">{msg.meta.message}</p>}
                    </div>
                    {isStudent && msg.meta?.status === "pending" && offerId && (
                        <div className="mt-4 flex gap-2">
                            <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={offerActionId === offerId}
                                onClick={() => onOfferDecision(offerId, "accept")}
                            >
                                <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:text-rose-700"
                                disabled={offerActionId === offerId}
                                onClick={() => onOfferDecision(offerId, "decline")}
                            >
                                <X className="h-4 w-4 mr-1" /> Decline
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative group w-full">
                    <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${isMe
                            ? "bg-[#2563EB] text-white rounded-tr-none shadow-sm"
                            : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm"
                            }`}
                    >
                        {msg.isDeleted ? (
                            <span className={isMe ? "text-white/70 italic" : "text-gray-400 italic"}>
                                This message was deleted
                            </span>
                        ) : isEditing ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Editing message</span>
                                    <span>
                                        {editingContent.length}/{MAX_MESSAGE_LENGTH}
                                    </span>
                                </div>
                                <Textarea
                                    value={editingContent}
                                    onChange={(e) => onEditChange(e.target.value)}
                                    rows={3}
                                    className="text-gray-900 bg-white"
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onCancelEdit}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={onSaveEdit}>
                                        Save changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {msg.content}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.attachments.map((file: any, idx: number) => (
                                            <a
                                                key={`${msg._id}-${idx}`}
                                                href={resolveFileUrl(file.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`block rounded-lg border px-3 py-2 text-xs ${isMe
                                                    ? "border-white/10 bg-white/20 text-white/90"
                                                    : "border-gray-200 bg-white text-gray-600"
                                                    }`}
                                            >
                                                {file.originalName}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {(canEdit || canDelete) && !isEditing && !msg.isDeleted && (
                        <div
                            className={`absolute top-2 ${isMe ? "right-2" : "left-2"
                                } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity`}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ${isMe
                                            ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                                            : "border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                                        aria-label="Message actions"
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isMe ? "end" : "start"} className="w-44">
                                    {canEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(msg)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit message
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && (
                                        <DropdownMenuItem className="text-rose-600" onClick={() => onConfirmDelete(msg)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete message
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[11px] text-gray-400">{format(new Date(msg.createdAt), "hh:mm a")}</span>
                {!msg.isDeleted && msg.editedAt && (
                    <span className="text-[10px] text-gray-400">Edited</span>
                )}
                {isMe && <span className="text-[10px] text-gray-400">{isRead ? "Read" : "Sent"}</span>}
            </div>
        </div>
    )
}
