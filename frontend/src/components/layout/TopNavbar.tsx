"use client"
// TopNavbar — thin orchestrator (~130 lines)
// Sub-components: NotificationDropdown (navbar/), ProfileDropdown (navbar/)
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useGetUserQuery, useLogoutUserMutation } from "@/lib/services/auth"
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/services/notifications"
import { notificationsApi } from "@/lib/services/notifications"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { useSocket } from "@/lib/hooks/useSocket"
import { toast } from "sonner"
import { assignmentsApi } from "@/lib/services/assignments"
import { submissionsApi } from "@/lib/services/submissions"
import { proposalsApi } from "@/lib/services/proposals"
import PostAssignmentModal from "@/components/assignments/PostAssignmentModal"
import { NotificationDropdown } from "./navbar/NotificationDropdown"
import { ProfileDropdown } from "./navbar/ProfileDropdown"

interface TopNavbarProps {
  greeting?: string
  notificationCount?: number
  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
}

const TopNavbar = ({
  greeting = "Good morning",
  notificationCount = 0,
  onSearch,
  onNotificationClick,
}: TopNavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { data: userData } = useGetUserQuery()
  const [logoutUser] = useLogoutUserMutation()
  const user = userData?.user

  const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery(
    { page: 1, limit: 6 },
    { skip: !user, pollingInterval: 30000 }
  )
  const [markNotificationRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllReadMutation()

  const notifications = notificationsData?.data?.notifications || []
  const unreadCount = notificationsData?.data?.unreadCount ?? notificationCount

  useSocket({
    onNotification: (payload) => {
      if (!user) return
      const incoming = payload?.notification || payload
      if (!incoming?._id) return
      toast(incoming.title || "New notification", {
        description: incoming.message,
        action: incoming.link ? { label: "View", onClick: () => router.push(incoming.link) } : undefined,
      })
      dispatch(
        notificationsApi.util.updateQueryData("getNotifications", { page: 1, limit: 6 }, (draft) => {
          if (!draft?.data) return
          if (!draft.data.notifications.some((n) => n._id === incoming._id)) {
            draft.data.notifications.unshift(incoming)
            draft.data.notifications = draft.data.notifications.slice(0, 6)
          }
          if (!incoming.isRead) draft.data.unreadCount = (draft.data.unreadCount || 0) + 1
        })
      )
      const assignmentId = incoming?.data?.assignmentId || incoming?.assignmentId || incoming?.assignment?._id || incoming?.assignment
      if (assignmentId) {
        dispatch(assignmentsApi.util.invalidateTags([{ type: "Assignment", id: assignmentId }, "Assignments"]))
        dispatch(proposalsApi.util.invalidateTags([{ type: "Proposals", id: `assignment-${assignmentId}` }, "Proposals"]))
        dispatch(submissionsApi.util.invalidateTags(["Submissions"]))
      }
    },
    onChatUpdated: (payload) => {
      const assignmentId = payload?.assignmentId
      if (!assignmentId) return
      dispatch(assignmentsApi.util.invalidateTags([{ type: "Assignment", id: assignmentId }, "Assignments"]))
      dispatch(proposalsApi.util.invalidateTags([{ type: "Proposals", id: `assignment-${assignmentId}` }, "Proposals"]))
    },
  })

  const handleLogout = async () => {
    try { await logoutUser({}).unwrap(); router.push("/") }
    catch (e) { console.error("Logout failed:", e) }
  }

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev)
    onNotificationClick?.()
    if (!showNotifications) refetchNotifications()
  }

  const handleNotificationItemClick = async (n: any) => {
    if (!n.isRead) await markNotificationRead(n._id).unwrap()
    if (n.link) router.push(n.link)
    setShowNotifications(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) onSearch(searchQuery.trim())
  }

  return (
    <header className="bg-[#f6f6f6] px-6 py-6">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{greeting}, {user?.name}!</h1>
          <p className="text-gray-600 text-sm mt-1">Let&apos;s make today productive!</p>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-primary-600 text-white h-[46px] px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center text-sm font-medium"
          >
            <Plus size={16} className="mr-1" /> Post Question
          </button>

          {/* Search */}
          <div className="relative">
            {!showSearchBar ? (
              <button onClick={() => setShowSearchBar(true)} className="p-2 text-gray-600 bg-white hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-[30px] h-[30px] overflow-hidden">
                  <Image src="/assets/icons/search.png" alt="Search" width={30} height={20} className="h-full object-cover" />
                </div>
              </button>
            ) : (
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    autoFocus
                  />
                  <button type="button" onClick={() => { setShowSearchBar(false); setSearchQuery("") }} className="ml-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg">✕</button>
                </div>
              </form>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={handleNotificationClick} className="relative p-2 text-gray-600 bg-white hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-[30px] h-[30px] overflow-hidden">
                <Image src="/assets/icons/bell.png" alt="Notifications" width={30} height={20} className="h-full object-cover" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onItemClick={handleNotificationItemClick}
                onMarkAllRead={() => markAllRead().unwrap()}
              />
            )}
          </div>

          {/* Profile */}
          <ProfileDropdown
            user={user}
            isOpen={showProfileMenu}
            onToggle={() => setShowProfileMenu((p) => !p)}
            onClose={() => setShowProfileMenu(false)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}

      <PostAssignmentModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={(data: any) => console.log("Assignment posted:", data)}
      />
    </header>
  )
}

export default TopNavbar
