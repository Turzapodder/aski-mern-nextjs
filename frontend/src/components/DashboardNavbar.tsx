'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  MessageSquare,
  Calendar,
  BarChart3,
  Home,
  Plus
} from 'lucide-react'
import { useGetUserQuery, useLogoutUserMutation } from '@/lib/services/auth'
import PostAssignmentModal from './PostAssignmentModal'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardNavbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false);
  
  const { data: userData, isLoading } = useGetUserQuery()
  const [logoutUser] = useLogoutUserMutation()
  
  const user = userData?.user
  
  const handleLogout = async () => {
    try {
      await logoutUser({}).unwrap()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }
  
  
  const handlePostAssignment = (data: any) => {
    console.log('Assignment posted:', data);
    // Handle assignment posting logic here
  }; 
  const navItems = [
    {
      name: 'Dashboard',
      href: '/user/dashboard',
      icon: Home,
      active: pathname === '/user/dashboard'
    },
    {
      name: 'Messages',
      href: '/user/messages',
      icon: MessageSquare,
      active: pathname === '/user/messages'
    },
    {
      name: 'Calendar',
      href: '/user/calendar',
      icon: Calendar,
      active: pathname === '/user/calendar'
    },
    {
      name: 'Analytics',
      href: '/user/analytics',
      icon: BarChart3,
      active: pathname === '/user/analytics'
    }
  ]
  
  if (isLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </nav>
    )
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/user/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Aski</span>
          </Link>
          
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        
        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          <div>
            <button  onClick={() => setShowPostModal(true)} className="bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center text-sm font-medium">
              <Plus size={16} className="mr-1"/> Post Question
            </button>
          </div>
          {/* Search */}
          <div className="hidden md:block relative">
            
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-64"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg relative"
            >
              <Bell size={20} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs">
                  {getInitials(user?.name || '')}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <Link 
                  href="/user/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                
                <Link 
                  href="/user/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                
                <hr className="my-2" />
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  item.active
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        ></div>
      )}
                <PostAssignmentModal 
              isOpen={showPostModal}
              onClose={() => setShowPostModal(false)}
              onSubmit={handlePostAssignment}
          />
    </nav>
  )
}

export default DashboardNavbar
