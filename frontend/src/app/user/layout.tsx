'use client';
import { useEffect } from 'react';
import TopNavbar from '@/components/TopNavbar';

import { useGetUserQuery } from '@/lib/services/auth';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setUserProfile } from '@/lib/features/auth/authSlice';
import { setMobileMenuOpen } from '@/lib/features/ui/uiSlice';
import { UserShellSkeleton } from '@/components/dashboard/DashboardSkeletons';
import MainSidebar from '@/components/sidebar/MainSidebar';

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: userData, isLoading } = useGetUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const sidebarCollapsed = useAppSelector((state) => !state.ui.isSidebarOpen);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);

  // Derive active item from pathname
  const activeItem = pathname?.split('/').pop() || 'dashboard';

  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;

      // Update the global state with the fetched user profile
      dispatch(setUserProfile(user));

      if (user.roles.includes('admin')) {
        router.replace('/admin');
        return;
      }
      if (
        user.roles.includes('tutor') &&
        user.onboardingStatus !== 'completed' &&
        user.onboardingStatus !== 'approved'
      ) {
        router.replace('/account/tutor-onboarding');
      }
    }
  }, [userData, router, dispatch]);

  if (isLoading) {
    return <UserShellSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />
      )}

      {/* Collapsible Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform 
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
      >
        <MainSidebar activeItem={activeItem} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-white md:hidden border-b">
          <button
            onClick={() => dispatch(setMobileMenuOpen(true))}
            className="p-2 mr-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-lg">Aski</span>
        </div>

        {/* We keep TopNavbar but maybe refine its mobile visibility or behavior */}
        <div className="hidden md:block">
          <TopNavbar
            onSearch={(query) => console.log('Search:', query)}
            onNotificationClick={() => console.log('Notifications clicked')}
            onProfileClick={() => console.log('Profile clicked')}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 gray-bg overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
