import UserSidebar from "@/components/UserSidebar"
const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-12">
      {/* <div className="col-span-2 h-screen">
        <UserSidebar />
      </div> */}

      <div className="col-span-12 bg-gray-100 h-screen">
        {children}
      </div>
    </div>
  )
}

export default UserLayout