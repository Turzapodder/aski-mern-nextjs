'use client'

import CollapsibleSidebar from "@/components/CollapsibleSidebar"
import TopNavbar from "@/components/TopNavbar"
const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 container mx-auto">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeItem="dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TopNavbar
          userName="Ratul"
          greeting="Good morning"
          notificationCount={3}
          onSearch={(query) => console.log("Search:", query)}
          onNotificationClick={() => console.log("Notifications clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-[#f6f6f6]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default UserLayout