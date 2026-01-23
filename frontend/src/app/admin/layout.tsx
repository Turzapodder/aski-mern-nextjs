"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertTriangle,
  BookOpen,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import useAdminAuth from "@/hooks/useAdminAuth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogoutUserMutation } from "@/lib/services/auth"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Tutors", href: "/admin/tutors", icon: GraduationCap },
  { label: "Assignments", href: "/admin/assignments", icon: FileText },
  { label: "Finance", href: "/admin/finance", icon: DollarSign },
  { label: "Disputes", href: "/admin/reports", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const getInitials = (name?: string) => {
  if (!name) return "A"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 0) return "A"
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAdminAuth()
  const [logoutUser] = useLogoutUserMutation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const activePath = useMemo(() => pathname || "/admin", [pathname])

  const handleLogout = async () => {
    try {
      await logoutUser({})
    } finally {
      router.push("/")
    }
  }

  const handleNavigate = () => {
    setIsNavigating(true)
    setMobileOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <div className="flex">
          <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
            <div className="flex items-center gap-3 px-5 py-5 border-b">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="px-4 py-6 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-xl" />
              ))}
            </div>
            <div className="mt-auto px-4 pb-6">
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </aside>

          <div className="flex-1">
            <header className="border-b bg-white/90 px-4 py-3 md:px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </header>
            <main className="p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const renderNavLinks = (variant: "desktop" | "mobile") => (
    <nav className={cn("space-y-1", variant === "mobile" ? "px-3 py-4" : "px-4 py-6")}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === "/admin" ? activePath === "/admin" : activePath.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary-100/70 text-primary-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-700"
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex">
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
          <div className="flex items-center gap-3 px-5 py-5 border-b">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Aski Admin</p>
              <p className="text-xs text-gray-500">Control Center</p>
            </div>
          </div>
          {renderNavLinks("desktop")}
          <div className="mt-auto px-4 pb-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.email || "admin@aski.com"}</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      aria-label="Open admin navigation"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="flex items-center gap-3 border-b px-4 py-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Aski Admin</p>
                        <p className="text-xs text-gray-500">Control Center</p>
                      </div>
                    </div>
                    {renderNavLinks("mobile")}
                  </SheetContent>
                </Sheet>

                <div>
                  <p className="text-sm font-semibold">Admin Dashboard</p>
                  <p className="text-xs text-gray-500">Manage Aski operations</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "admin@aski.com"}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-semibold">
                  {getInitials(user?.name)}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
            {isNavigating && <div className="h-0.5 w-full bg-primary-500/50 animate-pulse" />}
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
