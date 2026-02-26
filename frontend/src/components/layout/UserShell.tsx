"use client"
// Client wrapper for the user dashboard layout.
// Handles auth check, sidebar, mobile menu — keeping the parent layout.tsx as a Server Component.

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import CollapsibleSidebar from "@/components/CollapsibleSidebar"
import TopNavbar from "@/components/TopNavbar"
import useAuth from "@/hooks/useAuth"
import { useSidebar } from "@/hooks/useSidebar"
import { useMobileMenu } from "@/hooks/useMobileMenu"
import { useNavigation } from "@/hooks/useNavigation"
import { usePageTitle } from "@/hooks/usePageTitle"

export function UserShell({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isTutor, isLoading } = useAuth()
    const { collapsed, handleToggle } = useSidebar()
    const { isOpen: mobileSidebarOpen, close: closeMobile, open: openMobile } = useMobileMenu()
    const { activeItem } = useNavigation()
    const router = useRouter()

    usePageTitle()

    useEffect(() => {
        if (!user || isLoading) return
        if (isAdmin) {
            router.replace("/admin")
            return
        }
        if (
            isTutor &&
            user.onboardingStatus !== "completed" &&
            user.onboardingStatus !== "approved"
        ) {
            router.replace("/account/tutor-onboarding")
        }
    }, [user, isAdmin, isTutor, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="flex">
                    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
                        <div className="px-4 py-6 space-y-3">
                            <Skeleton className="h-8 w-32" />
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                    </aside>
                    <div className="flex-1">
                        <div className="border-b bg-white px-4 py-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-24" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-32 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Collapsible Sidebar */}
            <div
                className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
          ${collapsed ? "w-16" : "w-64"}
        `}
            >
                <CollapsibleSidebar activeItem={activeItem} onToggle={handleToggle} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile header */}
                <div className="flex items-center p-4 bg-white md:hidden border-b">
                    <button onClick={openMobile} className="p-2 mr-2 hover:bg-gray-100 rounded-md">
                        <Menu size={20} />
                    </button>
                    <span className="font-semibold text-lg">Aski</span>
                </div>

                {/* Desktop TopNavbar */}
                <div className="hidden md:block">
                    <TopNavbar
                        onSearch={(query) => console.log("Search:", query)}
                        onNotificationClick={() => console.log("Notifications clicked")}
                        onProfileClick={() => console.log("Profile clicked")}
                    />
                </div>

                <main className="flex-1 p-4 md:p-6 gray-bg overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
