'use client';

import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import TopNavbar from '@/components/TopNavbar';
import { UserShellSkeleton } from '@/components/dashboard/DashboardSkeletons';
import MainSidebar from '@/components/sidebar/MainSidebar';
import { setUserProfile } from '@/lib/features/auth/authSlice';
import { setMobileMenuOpen } from '@/lib/features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useGetUserQuery } from '@/lib/services/auth';

const UserLayoutClient = ({ children }: { children: ReactNode }) => {
  const { data: userData, isLoading } = useGetUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const sidebarCollapsed = useAppSelector((state) => !state.ui.isSidebarOpen);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

  const activeItem = useMemo(() => pathname?.split('/').pop() || 'dashboard', [pathname]);

  useEffect(() => {
    if (!userData?.user) {
      return;
    }

    const user = userData.user;

    // Avoid redundant store writes when the same profile is already present.
    if (user._id && user._id !== currentUserId) {
      dispatch(setUserProfile(user));
    }

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
  }, [userData, currentUserId, dispatch, router]);

  const closeMobileSidebar = useCallback(() => {
    dispatch(setMobileMenuOpen(false));
  }, [dispatch]);

  const openMobileSidebar = useCallback(() => {
    dispatch(setMobileMenuOpen(true));
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    console.log('Search:', query);
  }, []);

  const handleNotificationClick = useCallback(() => {
    console.log('Notifications clicked');
  }, []);

  const handleProfileClick = useCallback(() => {
    console.log('Profile clicked');
  }, []);

  if (isLoading) {
    return <UserShellSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
      >
        <MainSidebar activeItem={activeItem} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b bg-white p-4 md:hidden">
          <button onClick={openMobileSidebar} className="mr-2 rounded-md p-2 hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="text-lg font-semibold">Aski</span>
        </div>

        <div className="hidden md:block">
          <TopNavbar
            onSearch={handleSearch}
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
          />
        </div>

        <main className="gray-bg flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default UserLayoutClient;
