'use client'
import { useState } from 'react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { useLogoutUserMutation, useGetUserQuery } from '@/lib/services/auth'
import Link from 'next/link'
import { CopyMinus, Menu, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleSidebar } from '@/lib/features/ui/uiSlice'

interface SidebarItem {
  name: string
  icon: any
  href: string
  active?: boolean
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface CollapsibleSidebarProps {
  activeItem?: string
  onToggle?: (isCollapsed: boolean) => void
}

const CollapsibleSidebar = ({ activeItem, onToggle }: CollapsibleSidebarProps) => {
  const [logoutUser] = useLogoutUserMutation()
  const { data: userData } = useGetUserQuery()
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Notice that in UI slice it's 'isSidebarOpen', so 'isCollapsed' is '!isSidebarOpen'
  const isSidebarOpen = useAppSelector(state => state.ui.isSidebarOpen)
  const isCollapsed = !isSidebarOpen

  const handleToggle = () => {
    dispatch(toggleSidebar())
    onToggle?.(!isSidebarOpen)
  }

  const handleLogout = async () => {
    try {
      const response = await logoutUser({})
      if (response.data && response.data.status === "success") {
        // Clear any local storage or session data if needed
        router.push('/')
      }
    } catch (error) {
      console.log(error)
      // Even if logout fails, redirect to home page
      router.push('/')
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  // Check if user is a tutor/admin
  const roles = userData?.user?.roles || []
  const isTutor = roles.includes('tutor')

  const mainMenuItems = isTutor
    ? [
      { name: 'Home', icon: '/assets/icons/dashboard.png', href: '/user/dashboard', active: activeItem === 'dashboard' },
      { name: 'My Profile', icon: '/assets/icons/tutor.png', href: userData?.user?._id ? `/user/tutors/tutor-profile/${userData.user._id}` : '#', active: activeItem === 'tutor-profile' },
      { name: 'All Assignments', icon: '/assets/icons/tasks.png', href: '/user/assignments', active: activeItem === 'assignments' },
      { name: 'Ongoing Projects', icon: '/assets/icons/folder-icon.png', href: '/user/projects', active: activeItem === 'projects' },
      { name: 'Calendar', icon: '/assets/icons/calender-icon.png', href: '/user/calendar', active: activeItem === 'calendar' },
      { name: 'Inbox', icon: '/assets/icons/inbox.png', href: '/user/messages', active: activeItem === 'messages' },
      { name: 'Wallet', icon: '/assets/icons/rocket.png', href: '/user/wallet', active: activeItem === 'wallet' }
    ]
    : [
      { name: 'Home', icon: '/assets/icons/dashboard.png', href: '/user/dashboard', active: activeItem === 'dashboard' },
      { name: 'Tutors', icon: '/assets/icons/tutor.png', href: '/user/tutors', active: activeItem === 'tutors' },
      { name: 'My Assignments', icon: '/assets/icons/tasks.png', href: '/user/assignments', active: activeItem === 'assignments' },
      { name: 'Calendar', icon: '/assets/icons/calender-icon.png', href: '/user/calendar', active: activeItem === 'calendar' },
      { name: 'Inbox', icon: '/assets/icons/inbox.png', href: '/user/messages', active: activeItem === 'messages' }
    ]

  const sidebarSections: SidebarSection[] = [
    {
      title: 'MAIN MENU',
      items: mainMenuItems,
    },
  ]

  return (
    <aside
      className={`bg-[#f6f6f6] transition-all duration-300 py-4 flex flex-col h-full ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Image
                src="/assets/main-logo.svg"
                alt="logo"
                width={120}
                height={30}
                className={`min-w-[30px] min-h-[30px] w-[120px] mx-[10px] object-contain ${!isCollapsed && "mr-3"
                  }`}
              />
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <CopyMinus size={20} />}
          </button>
        </div >
      </div >

      {/* Navigation */}
      < nav className="flex-1 overflow-hidden p-4 space-y-6" >
        {
          sidebarSections.map((section) => {
            return (
              <div key={section.title}>
                {/* Section Header */}
                {!isCollapsed && (
                  <div className="mb-3">
                    <h3 className="text-sm text-black uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>
                )}

                {/* Section Items */}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`w-full flex items-center truncate px-3 py-4 rounded-lg transition-all duration-200 text-sm group ${item.active
                          ? "bg-primary-600 text-white font-bold shadow-lg shadow-primary-100"
                          : "text-gray-700 hover:bg-gray-200 hover:text-black"
                          }`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div
                          className={`flex items-center ${isCollapsed ? "justify-center w-full" : ""
                            }`}
                        >
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={30}
                            height={30}
                            className={`min-w-[30px] min-h-[30px] w-[30px] h-[30px] object-contain transition-all ${!isCollapsed && "mr-3"
                              } ${item.active ? "brightness-0 invert" : ""}`}
                          />

                          {!isCollapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        }
      </nav >

      {/* Logout */}
      < div className="p-4 " >
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-white hover:text-gray-900 group"
          title={isCollapsed ? "Logout" : undefined}
        >
          <Image
            src="/assets/icons/logout.png"
            alt="Logout"
            width={30}
            height={30}
            className="w-[30px] h-[30px] flex-shrink-0 mr-3"
          />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div >
      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <Link href="/user/profile" className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0 mr-2 group">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                {userData?.user?.profilePicture ? (
                  <Image
                    src={userData.user.profilePicture}
                    alt={userData.user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-semibold text-lg">
                    {userData?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {userData?.user?.name || 'User'}
                </span>
                <span className="text-xs text-gray-500 truncate hover:text-primary-500 hover:underline">
                  Visit Profile
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center items-center p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside >
  );
}

export default CollapsibleSidebar
