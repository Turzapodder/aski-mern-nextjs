"use client"
import Image from "next/image"
import { ArrowLeft, BadgeDollarSign, MoreVertical, Phone, Search } from "lucide-react"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency"

interface ChatHeaderProps {
    chatName: string
    assignmentTitle?: string
    assignmentBudget?: number
    assignmentDeadline?: string
    isOnline: boolean
    isConnected: boolean
    isTutor: boolean
    currency: string
    onBack: () => void
    onOpenOfferModal: () => void
    onDeleteChat: () => void
}

export function ChatHeader({
    chatName,
    assignmentTitle,
    assignmentBudget,
    assignmentDeadline,
    isOnline,
    isConnected,
    isTutor,
    currency,
    onBack,
    onOpenOfferModal,
    onDeleteChat,
}: ChatHeaderProps) {
    const formatAmount = (v?: number) => formatCurrency(v, currency)

    return (
        <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/95 border-b border-gray-100 backdrop-blur">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="sm:hidden inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{chatName}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{assignmentTitle || "Direct chat"}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            {isOnline && <div className="w-2 h-2 rounded-full bg-green-500" />}
                            <span className="text-xs text-gray-600 font-medium">{isOnline ? "Online" : "Offline"}</span>
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${isConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    }`}
                            >
                                Realtime {isConnected ? "On" : "Off"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    {isTutor && assignmentTitle && (
                        <button
                            onClick={onOpenOfferModal}
                            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                        >
                            <BadgeDollarSign className="h-4 w-4" />
                            Send Custom Offer
                        </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Search size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone size={18} />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={onDeleteChat} className="text-rose-600">
                                Delete chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Assignment info bar */}
            {assignmentTitle && (
                <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-100">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Assignment</p>
                            <p className="font-semibold text-gray-900">{assignmentTitle}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-xs text-gray-500">Budget</p>
                                <p className="font-semibold text-gray-900">{formatAmount(assignmentBudget ?? 0)}</p>
                            </div>
                            {assignmentDeadline && (
                                <div>
                                    <p className="text-xs text-gray-500">Deadline</p>
                                    <p className="font-semibold text-gray-900">
                                        {format(new Date(assignmentDeadline), "MMM dd, yyyy")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
