"use client"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"

interface ProfileDropdownProps {
    user: { name?: string; email?: string; profileImage?: string } | null | undefined
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
    onLogout: () => void
}

export function ProfileDropdown({
    user,
    isOpen,
    onToggle,
    onClose,
    onLogout,
}: ProfileDropdownProps) {
    return (
        <div className="relative pr-4">
            <button
                onClick={onToggle}
                className="flex items-center space-x-2 p-2 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <div className="w-8 h-8 overflow-hidden rounded-full">
                    <Image
                        src={user?.profileImage || "/assets/6.png"}
                        alt={user?.name || "User"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Link
                        href="/user/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        <User size={16} />
                        <span>Profile</span>
                    </Link>

                    <Link
                        href="/user/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        <Settings size={16} />
                        <span>Settings</span>
                    </Link>

                    <hr className="my-2" />

                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                        <LogOut size={16} />
                        <span>Sign out</span>
                    </button>
                </div>
            )}
        </div>
    )
}
