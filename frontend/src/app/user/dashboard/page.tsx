'use client'
import { useEffect, useState } from 'react'
import { useGetUserQuery } from '@/lib/services/auth'
import { useGetStudentFormQuery, useConvertFormToAssignmentMutation } from '@/lib/services/student'
import Sidebar from '@/components/Sidebar'
import PostAssignmentModal from '@/components/PostAssignmentModal'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Search, ChevronDown, ChevronLeft, Users, LayoutGrid, ChevronRight, Plus, Edit3, BookOpen, BarChart2, ListChecks, Briefcase, Target, Clock, Bell
} from 'lucide-react'
import Image from 'next/image'
import DashboardComponent from '@/components/DashboardComponent'
import TutorDashboard from '@/components/TutorDashboard'

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
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [convertForm] = useConvertFormToAssignmentMutation();

  useEffect(() => {
    if (isUserSuccess && userData?.user) {
      setUser({ name: userData.user.name || 'Taylor', avatar: userData.user.avatar || '/site-logo.png' });
      
      // Check for pending form data after login
      const storedSessionId = localStorage.getItem('pendingFormSessionId');
      console.log('Checking for stored session ID:', storedSessionId);
      
      if (storedSessionId) {
        console.log('Found stored session ID, converting form...');
        // Convert the form data
        convertForm({ sessionId: storedSessionId })
          .unwrap()
          .then((response) => {
            console.log('Convert form response:', response);
            if (response.formData) {
              setPendingFormData(response.formData);
              // Automatically show the modal with pre-filled data
              setShowPostModal(true);
              console.log('Form data converted and modal opened:', response.formData);
            }
            localStorage.removeItem('pendingFormSessionId');
            console.log('Session ID removed from localStorage');
          })
          .catch((error) => {
            console.error('Failed to convert form:', error);
            localStorage.removeItem('pendingFormSessionId');
          });
      } else {
        console.log('No stored session ID found');
      }
    }
  }, [userData, isUserSuccess, convertForm]);


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
    <div>
      <div className="flex h-screen bg-[#f6f6f6] font-sans">

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">


        {/* Main Layout with Middle Content and Right Sidebar */}
        <div className="flex gap-6">
          {/* Middle Content */}
          <div className="flex-1">
            {/* New Courses Section */}

            {/* Show pending form notification if exists */}
            {pendingFormData && (
              <div className="bg-primary-100 border border-primary-300 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-primary-800 mb-2">
                  Welcome! Your assignment request has been saved.
                </h3>
                <p className="text-primary-700 text-sm mb-3">
                  Subject: {pendingFormData.subject} | Description: {pendingFormData.description}
                </p>
                <button 
                  onClick={() => setPendingFormData(null)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600"
                >
                  Continue with this assignment
                </button>
              </div>
            )}

            {/* Conditionally render dashboard based on user role */}
            {userData?.user?.roles[0] === 'tutor' ? (
              <TutorDashboard
              user={userData?.user}
              />
            ) : (
              <DashboardComponent />
            )}
            


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

          </div>
        </div>

        </main>
      </div>
      
      {/* PostAssignmentModal */}
      <PostAssignmentModal 
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setPendingFormData(null);
        }}
        onSubmit={(data) => {
          console.log('Assignment submitted:', data);
          setShowPostModal(false);
          setPendingFormData(null);
          // Clean up localStorage after successful conversion
          localStorage.removeItem('pendingFormSessionId');
        }}
        initialData={pendingFormData}
      />
    </div>
  );
};

export default UserDashboard;