'use client';

import { useRouter } from 'nextjs-toploader/app';
import { useLogoutUserMutation, useGetUserQuery } from '@/lib/services/auth';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSidebar } from '@/lib/features/ui/uiSlice';
import { logout } from '@/lib/features/auth/authSlice';

import SidebarHeader from './SidebarHeader';
import SidebarMenu from './SidebarMenu';
import SidebarUser from './SidebarUser';
import { getSidebarItems } from './sidebarItems';

interface Props {
  activeItem?: string;
  onToggle?: (collapsed: boolean) => void;
}

export default function MainSidebar({ activeItem, onToggle }: Props) {
  const [logoutUser] = useLogoutUserMutation();
  const { data: userData } = useGetUserQuery();

  const router = useRouter();
  const dispatch = useAppDispatch();

  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const isCollapsed = !isSidebarOpen;

  const handleToggle = () => {
    dispatch(toggleSidebar());
    onToggle?.(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser({});
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(logout());
      router.push('/');
    }
  };

  const roles = userData?.user?.roles || [];
  const items = getSidebarItems(roles, userData?.user?._id, activeItem);

  return (
    <aside
      className={`bg-[#f6f6f6] transition-all duration-300 py-4 flex flex-col h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggle={handleToggle} />

      <SidebarMenu items={items} isCollapsed={isCollapsed} />

      <SidebarUser isCollapsed={isCollapsed} user={userData?.user} onLogout={handleLogout} />
    </aside>
  );
}
