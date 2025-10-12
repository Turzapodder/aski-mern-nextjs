"use client";
import { useState } from "react";
import {
  Search,
  Bell,
  User,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import PostAssignmentModal from "./PostAssignmentModal";
import { usePathname, useRouter } from "next/navigation";
import { useGetUserQuery, useLogoutUserMutation } from "@/lib/services/auth";
import Link from "next/link";

interface TopNavbarProps {
  userName?: string;
  greeting?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const TopNavbar = ({
  greeting = "Good morning",
  notificationCount = 0,
  onSearch,
  onNotificationClick,
}: TopNavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { data: userData } = useGetUserQuery();
  const [logoutUser] = useLogoutUserMutation();

  const user = userData?.user;

  const handleLogout = async () => {
    try {
      await logoutUser({}).unwrap();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handlePostAssignment = (data: any) => {
    console.log("Assignment posted:", data);
    // Handle assignment posting logic here
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <header className='bg-[#f6f6f6] px-6 py-6'>
      <div className='flex items-center justify-between'>
        {/* Greeting Section */}
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            {greeting}, {user?.name}!
          </h1>
          <p className='text-gray-600 text-sm mt-1'>
            Let's make today productive!
          </p>
        </div>

        {/* Right Section - Search, Notifications, Profile */}
        <div className='flex items-center space-x-3'>
          <div>
            <button
              onClick={() => setShowPostModal(true)}
              className='bg-primary-600 text-white h-[46px] px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center text-sm font-medium'
            >
              <Plus size={16} className='mr-1' /> Post Question
            </button>
          </div>
          {/* Search */}
          <div className='relative'>
            {!showSearchBar ? (
              <button
                onClick={() => setShowSearchBar(true)}
                className='p-2 text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <div className='w-[30px] h-[30px] overflow-hidden'>
                  <Image
                    src='/assets/icons/search.png'
                    alt='Search'
                    width={30}
                    height={20}
                    className='h-full object-cover'
                  />
                </div>
              </button>
            ) : (
              <form onSubmit={handleSearchSubmit} className='relative'>
                <div className='relative flex items-center'>
                  <Search
                    size={20}
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  />
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-colors'
                    autoFocus
                  />
                  <button
                    type='button'
                    onClick={() => {
                      setShowSearchBar(false);
                      setSearchQuery("");
                    }}
                    className='ml-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Notifications */}
          <div className='relative'>
            <button
              onClick={handleNotificationClick}
              className='relative p-2 text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <div className='w-[30px] h-[30px] overflow-hidden'>
                <Image
                  src='/assets/icons/bell.png'
                  alt='Notifications'
                  width={30}
                  height={20}
                  className='h-full object-cover'
                />
              </div>
              {notificationCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center'>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                <div className='p-4 border-b border-gray-200'>
                  <h3 className='font-semibold text-gray-900'>Notifications</h3>
                </div>
                <div className='max-h-64 overflow-y-auto'>
                  {notificationCount > 0 ? (
                    <div className='p-4'>
                      <div className='space-y-3'>
                        <div className='flex items-start space-x-3 p-2 hover:bg-gray-50 rounded'>
                          <div className='w-2 h-2 bg-secondary-200 rounded-full mt-2'></div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                              New task assigned
                            </p>
                            <p className='text-xs text-gray-600'>
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className='flex items-start space-x-3 p-2 hover:bg-gray-50 rounded'>
                          <div className='w-2 h-2 bg-primary-200 rounded-full mt-2'></div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                              Project deadline reminder
                            </p>
                            <p className='text-xs text-gray-600'>1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='p-4 text-center text-gray-500'>
                      <p className='text-sm'>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className='relative pr-4'>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='flex items-center space-x-2 p-2 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <div className='w-8 h-8 overflow-hidden rounded-full'>
                <Image
                  src={user?.profileImage || "/assets/6.png"}
                  alt={user?.name || "User"}
                  width={32}
                  height={32}
                  className='w-full h-full object-cover'
                />
              </div>
              <span className='hidden md:block text-sm font-medium'>
                {user?.name}
              </span>
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className='absolute right-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                <div className='px-4 py-2 border-b border-gray-200'>
                  <p className='text-sm font-medium text-gray-900'>
                    {user?.name}
                  </p>
                  <p className='text-xs text-gray-500'>{user?.email}</p>
                </div>

                <Link
                  href='/user/profile'
                  className='flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <Link
                  href='/user/settings'
                  className='flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>

                <hr className='my-2' />

                <button
                  onClick={handleLogout}
                  className='flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left'
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
      <PostAssignmentModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostAssignment}
      />
    </header>
  );
};

export default TopNavbar;
