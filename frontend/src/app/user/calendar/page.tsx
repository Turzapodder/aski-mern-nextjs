'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  
  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Math Tutoring Session',
      date: new Date(2024, 0, 15),
      time: '10:00 AM - 11:00 AM',
      type: 'tutoring',
      location: 'Online',
      participants: ['John Doe']
    },
    {
      id: 2,
      title: 'Physics Study Group',
      date: new Date(2024, 0, 16),
      time: '2:00 PM - 4:00 PM',
      type: 'group',
      location: 'Library Room 201',
      participants: ['Alice Smith', 'Bob Johnson', 'Carol Williams']
    },
    {
      id: 3,
      title: 'Chemistry Lab Review',
      date: new Date(2024, 0, 18),
      time: '1:00 PM - 2:30 PM',
      type: 'review',
      location: 'Chemistry Lab',
      participants: ['Dr. Brown']
    }
  ]
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }
  
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200"></div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${
                  event.type === 'tutoring' ? 'bg-primary-100 text-primary-800' :
                  event.type === 'group' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }
  
  const selectedDateEvents = getEventsForDate(selectedDate)
  
  return (
    <DashboardLayout>
      <div className="h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">Manage your tutoring sessions and study groups</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-white rounded-lg border border-gray-300">
                {(['month', 'week', 'day'] as const).map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={`px-4 py-2 text-sm font-medium capitalize ${
                      view === viewType
                        ? 'bg-primary-300 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    } ${viewType === 'month' ? 'rounded-l-lg' : viewType === 'day' ? 'rounded-r-lg' : ''}`}
                  >
                    {viewType}
                  </button>
                ))}
              </div>
              <button className="bg-primary-300 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                <Plus size={16} />
                <span>New Event</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Events */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={14} className="mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={14} className="mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users size={14} className="mr-2" />
                            {event.participants.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No events scheduled for this date.</p>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    Schedule Tutoring Session
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    Create Study Group
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    Set Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CalendarPage