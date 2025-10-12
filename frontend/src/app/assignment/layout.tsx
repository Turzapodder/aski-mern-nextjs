"use client";

import { useState } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import TopNavbar from "@/components/TopNavbar";

const AssignmentLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed);
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        activeItem='dashboard'
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area - with dynamic left margin based on sidebar state */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <TopNavbar
          notificationCount={3}
          onSearch={(query) => console.log("Search:", query)}
          onNotificationClick={() => console.log("Notifications clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />

        {/* Main Content */}
        <main className='flex-1 p-6 gray-bg overflow-x-hidden'>{children}</main>
      </div>
    </div>
  );
};

export default AssignmentLayout;
