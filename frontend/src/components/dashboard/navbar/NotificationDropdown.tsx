"use client"
import Image from "next/image"

interface Notification {
    _id: string
    title: string
    message: string
    isRead: boolean
    link?: string
    createdAt: string
}

interface NotificationDropdownProps {
    notifications: Notification[]
    unreadCount: number
    onItemClick: (n: Notification) => void
    onMarkAllRead: () => void
}

export function NotificationDropdown({
    notifications,
    unreadCount,
    onItemClick,
    onMarkAllRead,
}: NotificationDropdownProps) {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="text-xs font-semibold text-primary-500 hover:text-primary-600"
                    >
                        Mark all read
                    </button>
                )}
            </div>
            <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="p-2">
                        <div className="space-y-2">
                            {notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => onItemClick(n)}
                                    className="w-full text-left flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full mt-2 ${n.isRead ? "bg-gray-300" : "bg-primary-400"}`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                        <p className="text-xs text-gray-600">{n.message}</p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    )
}
