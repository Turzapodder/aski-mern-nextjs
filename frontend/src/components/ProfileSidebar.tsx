import React from 'react';
import { User, Lock, Bell, Briefcase, Link as LinkIcon } from 'lucide-react';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface ProfileSidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const sidebarItems: SidebarItem[] = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Emails & Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'businesses', label: 'Businesses', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'integration', label: 'Integration', icon: <LinkIcon className="w-4 h-4" /> },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="w-64 bg-white h-full flex flex-col py-6">
            <div className="px-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900">User profile management</h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default ProfileSidebar;
