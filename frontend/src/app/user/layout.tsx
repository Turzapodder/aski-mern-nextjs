'use client'
import { useState, useEffect } from "react"
import CollapsibleSidebar from "@/components/CollapsibleSidebar"
import TopNavbar from "@/components/TopNavbar"
import { useGetUserQuery } from "@/lib/services/auth"
import { useRouter, usePathname } from "next/navigation"
import { Menu } from "lucide-react"

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { data: userData, isLoading } = useGetUserQuery();
  const router = useRouter();
  const pathname = usePathname();

  // Derive active item from pathname
  const activeItem = pathname?.split('/').pop() || 'dashboard';


  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      if (user.roles.includes('tutor') && user.onboardingStatus !== 'completed' && user.onboardingStatus !== 'approved') {
        router.push('/account/tutor-onboarding');
      }
    }
  }, [userData, router]);

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className='flex h-screen bg-gray-100 font-sans'>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform 
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        <CollapsibleSidebar
          activeItem={activeItem}
          onToggle={handleSidebarToggle}
        // isMobile={false} // removed, not adding prop yet until sidebar updated
        />
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Header */}
        <div className="flex items-center p-4 bg-white md:hidden border-b">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 mr-2 hover:bg-gray-100 rounded-md">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-lg">Aski</span>
        </div>

        {/* We keep TopNavbar but maybe refine its mobile visibility or behavior */}
        <div className="hidden md:block">
          <TopNavbar
            notificationCount={3}
            onSearch={(query) => console.log("Search:", query)}
            onNotificationClick={() => console.log("Notifications clicked")}
            onProfileClick={() => console.log("Profile clicked")}
          />
        </div>

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-6 gray-bg overflow-x-hidden overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}

export default UserLayout
