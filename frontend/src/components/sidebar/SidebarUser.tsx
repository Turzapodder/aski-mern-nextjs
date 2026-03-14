import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface Props {
  isCollapsed: boolean;
  user?: any;
  onLogout: () => void;
}

export default function SidebarUser({ isCollapsed, user, onLogout }: Props) {
  return (
    <div className="p-4 border-t border-gray-200">
      {!isCollapsed ? (
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <Link href="/user/profile" className="flex items-center space-x-3 overflow-hidden flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500 font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-500">Visit Profile</span>
            </div>
          </Link>

          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={onLogout}
          className="w-full flex justify-center p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
        >
          <LogOut size={20} />
        </button>
      )}
    </div>
  );
}
