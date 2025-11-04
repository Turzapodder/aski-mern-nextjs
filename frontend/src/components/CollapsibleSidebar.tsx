'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogoutUserMutation, useGetUserQuery } from '@/lib/services/auth'
import {  CopyMinus, Menu, X} from 'lucide-react'

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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggle?.(newCollapsedState)
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

  // Check if user is a tutor
  const isTutor = userData?.user?.roles?.[0] === 'tutor'

  const sidebarSections: SidebarSection[] = [
    {
      title: 'MAIN MENU',
      items: isTutor ? [
        { name: 'Home', icon: '/assets/icons/dashboard.png', href: '/user/dashboard', active: activeItem === 'dashboard' },
        { name: 'All Assignments', icon: '/assets/icons/tasks.png', href: '/user/assignments', active: activeItem === 'assignments' },
        { name: 'Ongoing Projects', icon: '/assets/icons/folder-icon.png', href: '/user/projects', active: activeItem === 'projects' },
        { name: 'Calendar', icon: '/assets/icons/calender-icon.png', href: '/user/calendar', active: activeItem === 'calendar' },
        { name: 'Inbox', icon: '/assets/icons/inbox.png', href: '/user/messages', active: activeItem === 'messages' }
      ] : [
        { name: 'Home', icon: '/assets/icons/dashboard.png', href: '/user/dashboard', active: activeItem === 'dashboard' },
        { name: 'Tutors', icon: '/assets/icons/tutor.png', href: '/user/tutors', active: activeItem === 'tasks' },
        { name: 'My Assignments', icon: '/assets/icons/tasks.png', href: '/user/projects', active: activeItem === 'projects' },
        { name: 'Calendar', icon: '/assets/icons/calender-icon.png', href: '/user/calendar', active: activeItem === 'calendar' },
        { name: 'Inbox', icon: '/assets/icons/inbox.png', href: '/user/messages', active: activeItem === 'calendar' }
      ],
    },
    {
      title: 'STARTED',
      items: [
        { name: 'Finalize Homepage Wireframe', icon: '/assets/icons/folder-icon.png', href: '/assignment/details?id=1' },
        { name: 'Review Client Feedback Form', icon: '/assets/icons/folder-icon.png', href: '/assignment/details?id=2' },
        { name: 'Update Progress Report Document', icon: '/assets/icons/folder-icon.png', href: '/assignment/details?id=3' }
      ],
    },
  ]

  return (
    <aside
      className={`bg-[#f6f6f6] transition-all duration-300 py-4 flex flex-col h-screen fixed left-0 top-0 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img
                src="/assets/main-logo.svg"
                alt="logo"
                className={`min-w-[30px] min-h-[30px] w-[120px] mx-[10px] object-contain ${
                  !isCollapsed && "mr-3"
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
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden p-4 space-y-6">
        {sidebarSections.map((section) => {
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
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center truncate px-3 py-4 rounded-lg transition-colors text-sm group ${
                        item.active
                          ? "bg-white text-gray-900 font-medium"
                          : "text-black hover:bg-gray-200 hover:text-black"
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div
                        className={`flex items-center ${
                          isCollapsed ? "justify-center w-full" : ""
                        }`}
                      >
                        <img
                          src={item.icon}
                          alt={item.name}
                          className={`min-w-[30px] min-h-[30px] w-[30px] h-[30px] object-contain ${
                            !isCollapsed && "mr-3"
                          }`}
                        />

                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 ">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:bg-white hover:text-gray-900 group"
          title={isCollapsed ? "Logout" : undefined}
        >
          <img
            src="/assets/icons/logout.png"
            alt="/assets/icons/logout.png"
            className="w-[30px] h-[30px] flex-shrink-0 mr-3"
          />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default CollapsibleSidebar