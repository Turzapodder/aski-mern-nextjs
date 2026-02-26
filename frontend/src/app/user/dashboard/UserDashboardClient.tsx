"use client"

import React from 'react'
import PostAssignmentModal from '@/components/PostAssignmentModal'
import {
  ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react'
import DashboardComponent from '@/components/DashboardComponent'
import TutorDashboard from '@/components/TutorDashboard'
import { useUserDashboardLogic } from './useUserDashboardLogic'

export const UserDashboardClient = () => {
  const {
    userData,
    showPostModal,
    setShowPostModal,
    pendingFormData,
    setPendingFormData,
    currentMonth,
    prevMonth,
    nextMonth
  } = useUserDashboardLogic();

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

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
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
          {
            userData?.user?.roles?.includes('tutor') ? (
              <TutorDashboard
                user={userData?.user}
              />
            ) : (
              <DashboardComponent />
            )
          }



        </div >

        {/* Right Sidebar */}
        < div className="w-80 space-y-6" >
          {/* Go Premium */}
          < div className="bg-gray-800 text-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center relative overflow-hidden" >
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary-300 rounded-full flex items-center justify-center">
                <Briefcase size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Go Premium</h4>
              <p className="text-sm opacity-80 mb-4">Explore 25k+ courses with lifetime membership.</p>
              <button className="bg-primary-300 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-primary-600 transition-colors w-full">
                Get Access
              </button>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          </div >

          {/* Calendar */}
          < div className="bg-white p-6 rounded-xl shadow-sm border" >
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
          </div >

        </div >
      </div >



      {/* PostAssignmentModal */}
      < PostAssignmentModal
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
    </div >
  );
};
