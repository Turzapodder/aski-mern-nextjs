'use client'
import { useRouter } from 'next/navigation'
import { useLogoutUserMutation } from '@/lib/services/auth'
import { 
  LayoutGrid, MessageSquare, Bell, CalendarDays, Users, Settings, LogOut, 
  BookOpen, Briefcase
} from 'lucide-react'

interface SidebarItem {
  name: string;
  icon: any;
  href: string;
  active?: boolean;
  badge?: number;
}

interface SidebarProps {
  activeItem?: string;
}

const Sidebar = ({ activeItem }: SidebarProps) => {
  const [logoutUser] = useLogoutUserMutation()
  const router = useRouter();

  // const handleLogout = async () => {
  //   try {
  //     const response: any = await logoutUser()
  //     if (response.data && response.data.status === "success") {
  //       router.push('/')
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/user/dashboard', active: activeItem === 'dashboard' },
    { name: 'My Assignments', icon: BookOpen, href: '/user/courses' },

    { name: 'My Classes', icon: Briefcase, href: '/user/assignments' },
    { name: 'Messages', icon: MessageSquare, href: '/user/messages', active: activeItem === 'messages', badge: 3 },
    { name: 'Notifications', icon: Bell, href: '/user/notifications', badge: 2 },
    { name: 'Calendars', icon: CalendarDays, href: '/user/calendar' },
    { name: 'Community', icon: Users, href: '/user/community' },
    { name: 'Settings', icon: Settings, href: '/user/settings' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <aside className="bg-gray-800 text-white w-64 p-4 space-y-6 flex flex-col h-screen h-100">

      <nav className="flex-grow">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <button 
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-colors text-sm text-left
                  ${item.active ? 'bg-primary-300 text-white' : 'hover:bg-gray-700 text-gray-300'}
                `}
              >
                <item.icon size={20} className="mr-3 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Download App Section */}
      <div className="bg-primary-300 rounded-xl p-4 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Briefcase size={24} className="text-white"/>
          </div>
          <p className="text-sm font-semibold mb-1">Download our mobile app</p>
          <button className="text-xs bg-white text-primary-300 px-3 py-1 rounded-md font-medium hover:bg-gray-100">
            Get it now
          </button>
        </div>
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
      </div>
    </aside>
  );
};

export default Sidebar;