'use client'
import { useEffect, useState } from 'react'
import { useGetUserQuery } from '@/lib/services/auth'
import Sidebar from '@/components/Sidebar'
import PostAssignmentModal from '@/components/PostAssignmentModal'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Search, ChevronDown, ChevronLeft, Users, LayoutGrid, ChevronRight, Plus, Edit3, BookOpen, BarChart2, ListChecks, Briefcase, Target, Clock, Bell
} from 'lucide-react'
import Image from 'next/image'

// Mock User Data - replace with actual data fetching
const mockUser = {
  name: 'Taylor',
  avatar: '/site-logo.png' // Using available logo as placeholder
};

// Mock Data - replace with actual data from your backend
const newCoursesData = [
  { id: 1, title: 'Content Writing', lessons: 12, icon: Edit3, type: 'Data Research', rating: 4.8, bgColor: 'bg-orange-100', iconColor: 'text-orange-500' },
  { id: 2, title: 'Usability Testing', lessons: 15, icon: Users, type: 'UI/UX Design', rating: 5.0, bgColor: 'bg-primary-100', iconColor: 'text-primary-300' },
  { id: 3, title: 'Photography', lessons: 8, icon: Briefcase, type: 'Art and Design', rating: 4.6, bgColor: 'bg-purple-100', iconColor: 'text-purple-500' },
];

const hoursActivityData = {
  increase: '+3%',
  lastWeek: 'than last week',
  current: { time: '6h 45 min', date: '5 Jan 2023' },
  bars: [ 
    {day: 'Su', height: 'h-12', active: false}, 
    {day: 'Mo', height: 'h-20', active: false}, 
    {day: 'Tu', height: 'h-10', active: false}, 
    {day: 'We', height: 'h-32', active: true}, 
    {day: 'Th', height: 'h-8', active: false}, 
    {day: 'Fr', height: 'h-16', active: false}, 
    {day: 'Sa', height: 'h-24', active: false}
  ]
};

const dailyScheduleData = [
  { id: 1, title: 'Design System', subtitle: 'Lecture - Class', icon: LayoutGrid, bgColor: 'bg-orange-100', iconColor: 'text-orange-500' },
  { id: 2, title: 'Typography', subtitle: 'Group - Test', icon: Target, bgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
  { id: 3, title: 'Color Style', subtitle: 'Group - Test', icon: Clock, bgColor: 'bg-primary-100', iconColor: 'text-primary-300' },
  { id: 4, title: 'Visual Design', subtitle: 'Lecture - Test', icon: ListChecks, bgColor: 'bg-purple-100', iconColor: 'text-purple-500' },
];

const coursesTakingData = [
    { id: 1, title: '3D Design Course', instructor: 'Micheal Andrew', remaining: '8h 45 min', progress: 45, icon: Edit3, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' }, 
    { id: 2, title: 'Development Basics', instructor: 'Natalia Vaman', remaining: '18h 12 min', progress: 75, icon: BookOpen, iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
];

const assignmentsData = [
    { id: 1, title: 'Methods of data', date: '02 July, 10:30 AM', status: 'In progress', statusColor: 'bg-blue-100 text-blue-600', icon: BarChart2, iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
    { id: 2, title: 'Market Research', date: '14 June, 12:45 AM', status: 'Completed', statusColor: 'bg-primary-100 text-primary-600', icon: Target, iconBg: 'bg-primary-100', iconColor: 'text-primary-300' },
    { id: 3, title: 'Data Collection', date: '12 May, 11:00 AM', status: 'Upcoming', statusColor: 'bg-orange-100 text-orange-600', icon: ListChecks, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
];

const UserDashboard = () => {
  const { data: userData, isSuccess: isUserSuccess } = useGetUserQuery();
  const [user, setUser] = useState(mockUser);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (isUserSuccess && userData?.user) {
      setUser({ name: userData.user.name || 'Taylor', avatar: userData.user.avatar || '/site-logo.png' });
    }
  }, [userData, isUserSuccess]);


  // Calendar state and functions
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Use current date instead of fixed 2023, 7
  const today = new Date();

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startingDay = firstDayOfMonth(currentMonth);
    const daysArray = [];

    for (let i = 0; i < startingDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentMonth.getMonth() && 
                     today.getFullYear() === currentMonth.getFullYear();
      
      daysArray.push(
        <div 
          key={day} 
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer
            ${isToday ? 'bg-primary-300 text-white' : 'hover:bg-gray-100 text-gray-700'}
          `}
        >
          {day}
        </div>
      );
    }
    return daysArray;
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50 font-sans">
        {/* Reusable Sidebar */}
        <Sidebar activeItem="dashboard" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Welcome back Taylor 👋</h2>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </header>

        {/* Main Layout with Middle Content and Right Sidebar */}
        <div className="flex gap-6">
          {/* Middle Content */}
          <div className="flex-1">
            {/* New Courses Section */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">New Courses</h3>
                <a href="#" className="text-sm text-primary-300 hover:underline font-medium">View All</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newCoursesData.map(course => (
                  <div key={course.id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border">
                    <div className="flex items-start mb-4">
                      <div className={`p-3 rounded-xl ${course.bgColor} mr-4`}>
                        <course.icon size={24} className={course.iconColor} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                        <p className="text-sm text-gray-500">{course.lessons} Lessons</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm font-medium text-gray-700">{course.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Hours Activity and Daily Schedule Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Hours Activity */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Hours Activity</h3>
                    <p className="text-sm text-primary-300 font-medium">{hoursActivityData.increase} <span className="text-gray-500 font-normal">{hoursActivityData.lastWeek}</span></p>
                  </div>
                  <button className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center">
                    Weekly <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
                <div className="h-48 flex items-end justify-between space-x-3">
                  {hoursActivityData.bars.map((bar, index) => (
                    <div key={bar.day} className="flex flex-col items-center flex-1">
                      <div className={`w-full max-w-8 ${bar.height} rounded-t-lg transition-colors relative group
                        ${bar.active ? 'bg-primary-300' : 'bg-gray-200 hover:bg-gray-300'}
                      `}>
                        {bar.active && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {hoursActivityData.current.time}<br/>{hoursActivityData.current.date}
                            </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Schedule */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Schedule</h3>
                <div className="space-y-3">
                  {dailyScheduleData.map(item => (
                    <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className={`p-2.5 rounded-lg ${item.bgColor} mr-3`}>
                        <item.icon size={18} className={item.iconColor} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course You're Taking */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Assignments you submitted</h3>
                    <div className="flex items-center space-x-2">
                        <button className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center">
                            Active <ChevronDown size={16} className="ml-1" />
                        </button>
                        <button className="bg-primary-100 text-primary-600 p-2 rounded-lg hover:bg-primary-200">
                            <Plus size={18}/>
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {coursesTakingData.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl ${course.iconBg} mr-4`}>
                                    <course.icon size={24} className={course.iconColor} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">{course.title}</p>
                                    <p className="text-xs text-gray-500">{course.instructor}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                                    <p className="text-sm font-medium text-gray-700">{course.remaining}</p>
                                </div>
                                <div className="relative w-12 h-12">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="text-primary-300" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${course.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-primary-600">
                                        {course.progress}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* Go Premium */}
            <div className="bg-gray-800 text-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary-300 rounded-full flex items-center justify-center">
                  <Briefcase size={32} className="text-white"/>
                </div>
                <h4 className="text-lg font-semibold mb-2">Go Premium</h4>
                <p className="text-sm opacity-80 mb-4">Explore 25k+ courses with lifetime membership.</p>
                <button className="bg-primary-300 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-primary-600 transition-colors w-full">
                  Get Access
                </button>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100">
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentMonth.toLocaleString('default', { month: 'long' })}, {currentMonth.getFullYear()}
                  </h3>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-3">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="py-2 font-medium">{day}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Assignments</h3>
                    <button className="bg-primary-100 text-primary-600 p-2 rounded-lg hover:bg-primary-200">
                        <Plus size={18}/>
                    </button>
                </div>
                <div className="space-y-3">
                    {assignmentsData.map(item => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-start mb-3">
                                <div className={`p-2.5 rounded-lg ${item.iconBg} mr-3 mt-0.5`}>
                                    <item.icon size={18} className={item.iconColor} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 mb-1">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.date}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${item.statusColor}`}>
                              {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        </main>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;