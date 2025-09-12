"use client";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import DashboardComponent from "@/components/DashboardComponent";
import TopNavbar from "@/components/TopNavbar";
import TutorComponent from "@/components/TutorComponent";

const CollapsibleSidebarDemo = () => {
  return (
    <div className="flex h-screen bg-gray-100">
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
        <main className="flex-1 p-6 overflow-y-auto bg-[#f6f6f6]">
          {/* <DashboardComponent /> */}
          <TutorComponent />
        </main>
      </div>
    </div>
  );
};

export default CollapsibleSidebarDemo;
