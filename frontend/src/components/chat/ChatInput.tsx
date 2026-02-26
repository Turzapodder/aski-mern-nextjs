"use client"
import { BadgeDollarSign, Paperclip, Send } from "lucide-react"

const MAX_MESSAGE_LENGTH = 1000

interface ChatInputProps {
    value: string
    tutorBlocked: boolean
    activeOffer: any | null
    isTutor: boolean
    assignmentTitle?: string
    inputRef: React.RefObject<HTMLTextAreaElement | null>
    fileInputRef: React.RefObject<HTMLInputElement | null>
    onChange: (value: string) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onSend: (e?: React.FormEvent) => void
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    onOpenOfferModal: () => void
}

export function ChatInput({
    value,
    tutorBlocked,
    activeOffer,
    isTutor,
    assignmentTitle,
    inputRef,
    fileInputRef,
    onChange,
    onKeyDown,
    onSend,
    onFileSelect,
    onOpenOfferModal,
}: ChatInputProps) {
    return (
        <div className="p-4 bg-white border-t border-gray-100">
            {tutorBlocked && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Waiting for the student to start the conversation.
                </div>
            )}
            {activeOffer && (
                <div className="mb-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs text-primary-700">
                    You already have a pending custom offer in this conversation.
                </div>
            )}

            <form onSubmit={onSend} className="flex flex-col gap-2 bg-[#F3F4F9] p-3 rounded-2xl">
                <div className="flex items-end gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={onFileSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={tutorBlocked}
                    >
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type a message..."
                        maxLength={MAX_MESSAGE_LENGTH}
                        disabled={tutorBlocked}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm resize-none max-h-40 leading-6"
                    />

                    <button
                        type="submit"
                        disabled={!value.trim() || value.length > MAX_MESSAGE_LENGTH || tutorBlocked}
                        className="p-2 text-[#2563EB] hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                        {value.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                    {isTutor && assignmentTitle && (
                        <button
                            type="button"
                            onClick={onOpenOfferModal}
                            disabled={tutorBlocked || Boolean(activeOffer)}
                            className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BadgeDollarSign className="h-3 w-3" />
                            Send Custom Offer
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
