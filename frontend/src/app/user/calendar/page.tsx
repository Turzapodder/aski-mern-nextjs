'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, X } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import EventCalendar from '@/components/EventCalendar'

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  
  // State for modal
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Mock events data with multi-day events
  const events = [
    {
      id: 1,
      title: 'Math Tutoring Session',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 15),
      time: '10:00 AM - 11:00 AM',
      type: 'tutoring',
      location: 'Online',
      participants: ['John Doe'],
      description: 'One-on-one tutoring session focusing on calculus concepts.'
    },
    {
      id: 2,
      title: 'Physics Study Group',
      startDate: new Date(2024, 0, 16),
      endDate: new Date(2024, 0, 16),
      time: '2:00 PM - 4:00 PM',
      type: 'group',
      location: 'Library Room 201',
      participants: ['Alice Smith', 'Bob Johnson', 'Carol Williams'],
      description: 'Group study session to prepare for upcoming physics exam.'
    },
    {
      id: 3,
      title: 'Chemistry Lab Review',
      startDate: new Date(2024, 0, 18),
      endDate: new Date(2024, 0, 18),
      time: '1:00 PM - 2:30 PM',
      type: 'review',
      location: 'Chemistry Lab',
      participants: ['Dr. Brown'],
      description: 'Review of lab procedures and safety protocols.'
    },
    {
      id: 4,
      title: 'Biology Research Project',
      startDate: new Date(2024, 0, 20),
      endDate: new Date(2024, 0, 22),
      time: 'All Day',
      type: 'project',
      location: 'Science Building',
      participants: ['Research Team', 'Dr. Smith'],
      description: 'Three-day intensive research project on cellular biology.'
    },
    {
      id: 5,
      title: 'Literature Conference',
      startDate: new Date(2024, 0, 25),
      endDate: new Date(2024, 0, 27),
      time: '9:00 AM - 5:00 PM',
      type: 'conference',
      location: 'University Hall',
      participants: ['English Department', 'Guest Speakers'],
      description: 'Annual literature conference with guest speakers and workshops.'
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
  
  // Helper to check if a date falls within an event's date range
  const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
    const dateTime = date.getTime();
    const startDateTime = startDate.getTime();
    const endDateTime = endDate.getTime();
    return dateTime >= startDateTime && dateTime <= endDateTime;
  }
  
  // Get events for a specific date, including multi-day events
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isDateInRange(date, event.startDate, event.endDate)
    )
  }
  
  // Handle event click
  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the day click
    setSelectedEvent(event);
    setShowModal(true);
  }
  
  // Helper to determine if an event is the first day in the current view
  const isFirstDayOfEvent = (event: any, date: Date) => {
    return event.startDate.toDateString() === date.toDateString();
  }
  
  // Helper to determine if an event is the last day in the current view
  const isLastDayOfEvent = (event: any, date: Date) => {
    return event.endDate.toDateString() === date.toDateString();
  }
  
  // Helper to determine event position and styling for multi-day events
  const getEventPositionClass = (event: any, date: Date) => {
    const isFirst = isFirstDayOfEvent(event, date);
    const isLast = isLastDayOfEvent(event, date);
    
    if (isFirst && isLast) return 'rounded';
    if (isFirst) return 'rounded-l';
    if (isLast) return 'rounded-r';
    return '';
  }
  
  // Render calendar days for month view
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
                onClick={(e) => handleEventClick(event, e)}
                className={`text-xs p-1 truncate cursor-pointer hover:opacity-80 ${
                  event.type === 'tutoring' ? 'bg-primary-100 text-primary-800' :
                  event.type === 'group' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'project' ? 'bg-green-100 text-green-800' :
                  event.type === 'conference' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                } ${getEventPositionClass(event, date)}`}
              >
                {isFirstDayOfEvent(event, date) ? event.title : '→ ' + event.title}
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
  
  // Render calendar for week view
  const renderWeekView = () => {
    const weekDays = [];
    const currentDay = new Date(selectedDate);
    
    // Set to the beginning of the week (Sunday)
    currentDay.setDate(currentDay.getDate() - currentDay.getDay());
    
    // Create 7 days for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDay);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      weekDays.push(
        <div key={i} className="border-r border-gray-200 last:border-r-0">
          <div 
            onClick={() => setSelectedDate(date)}
            className={`p-2 text-center cursor-pointer ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
          >
            <div className="text-sm font-medium">{date.getDate()}</div>
            <div className="text-xs text-gray-500">{daysOfWeek[i]}</div>
          </div>
          <div className="min-h-[500px] p-1 space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className={`text-xs p-1 truncate cursor-pointer hover:opacity-80 ${
                  event.type === 'tutoring' ? 'bg-primary-100 text-primary-800' :
                  event.type === 'group' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'project' ? 'bg-green-100 text-green-800' :
                  event.type === 'conference' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                } ${getEventPositionClass(event, date)}`}
              >
                {isFirstDayOfEvent(event, date) ? event.title : '→ ' + event.title}
              </div>
            ))}
          </div>
        </div>
      );
      
      // Move to the next day
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return weekDays;
  }
  
  const selectedDateEvents = getEventsForDate(selectedDate)
  
  // Event Modal Component
  const EventModal = () => {
    if (!showModal || !selectedEvent) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
        <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedEvent.type === 'tutoring' ? 'bg-primary-100 text-primary-800' :
                selectedEvent.type === 'group' ? 'bg-blue-100 text-blue-800' :
                selectedEvent.type === 'project' ? 'bg-green-100 text-green-800' :
                selectedEvent.type === 'conference' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedEvent.type}
              </span>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Date:</p>
              <p className="text-gray-600">
                {selectedEvent.startDate.toLocaleDateString()} 
                {selectedEvent.startDate.toDateString() !== selectedEvent.endDate.toDateString() && 
                  ` - ${selectedEvent.endDate.toLocaleDateString()}`}
              </p>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Time:</p>
              <p className="text-gray-600">{selectedEvent.time}</p>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Location:</p>
              <p className="text-gray-600">{selectedEvent.location}</p>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Participants:</p>
              <p className="text-gray-600">{selectedEvent.participants.join(', ')}</p>
            </div>
            
            {selectedEvent.description && (
              <div className="text-sm">
                <p className="text-gray-700 font-medium">Description:</p>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    // <div>
    //   <div className="h-screen bg-gray-50 p-6">
    //     <div className="max-w-7xl mx-auto">
    //       {/* Header */}
    //       <div className="flex items-center justify-between mb-6">
    //         <div>
    //           <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
    //           <p className="text-gray-600">Manage your tutoring sessions and study groups</p>
    //         </div>
    //         <div className="flex items-center space-x-4">
    //           {/* View Toggle */}
    //           <div className="flex bg-white rounded-lg border border-gray-300">
    //             {(['month', 'week'] as const).map((viewType) => (
    //               <button
    //                 key={viewType}
    //                 onClick={() => setView(viewType)}
    //                 className={`px-4 py-2 text-sm font-medium capitalize ${
    //                   view === viewType
    //                     ? 'bg-primary-300 text-white'
    //                     : 'text-gray-700 hover:text-gray-900'
    //                 } ${viewType === 'month' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
    //               >
    //                 {viewType}
    //               </button>
    //             ))}
    //           </div>
    //           <button className="bg-primary-300 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
    //             <Plus size={16} />
    //             <span>New Event</span>
    //           </button>
    //         </div>
    //       </div>
          
    //       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    //         {/* Calendar */}
    //         <div className="lg:col-span-3">
    //           <div className="bg-white rounded-lg shadow">
    //             {/* Calendar Header */}
    //             <div className="flex items-center justify-between p-4 border-b border-gray-200">
    //               <button
    //                 onClick={() => navigateMonth('prev')}
    //                 className="p-2 hover:bg-gray-100 rounded-lg"
    //               >
    //                 <ChevronLeft size={20} />
    //               </button>
    //               <h2 className="text-lg font-semibold text-gray-900">
    //                 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
    //               </h2>
    //               <button
    //                 onClick={() => navigateMonth('next')}
    //                 className="p-2 hover:bg-gray-100 rounded-lg"
    //               >
    //                 <ChevronRight size={20} />
    //               </button>
    //             </div>
                
    //             {/* Days of Week Header */}
    //             <div className="grid grid-cols-7 border-b border-gray-200">
    //               {daysOfWeek.map(day => (
    //                 <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
    //                   {day}
    //                 </div>
    //               ))}
    //             </div>
                
    //             {/* Calendar Grid */}
    //             <div className="grid grid-cols-7">
    //               {view === 'month' ? renderCalendarDays() : renderWeekView()}
    //             </div>
    //           </div>
    //         </div>
            
    //         {/* Sidebar */}
    //         <div className="space-y-6">
    //           {/* Selected Date Events */}
    //           <div className="bg-white rounded-lg shadow p-4">
    //             <h3 className="text-lg font-semibold text-gray-900 mb-4">
    //               {selectedDate.toLocaleDateString('en-US', { 
    //                 weekday: 'long', 
    //                 month: 'long', 
    //                 day: 'numeric' 
    //               })}
    //             </h3>
                
    //             {selectedDateEvents.length > 0 ? (
    //               <div className="space-y-3">
    //                 {selectedDateEvents.map(event => (
    //                   <div 
    //                     key={event.id} 
    //                     className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
    //                     onClick={(e) => handleEventClick(event, e)}
    //                   >
    //                     <h4 className="font-medium text-gray-900">{event.title}</h4>
    //                     <div className="mt-2 space-y-1">
    //                       <div className="flex items-center text-sm text-gray-600">
    //                         <Clock size={14} className="mr-2" />
    //                         {event.time}
    //                       </div>
    //                       <div className="flex items-center text-sm text-gray-600">
    //                         <MapPin size={14} className="mr-2" />
    //                         {event.location}
    //                       </div>
    //                       <div className="flex items-center text-sm text-gray-600">
    //                         <Users size={14} className="mr-2" />
    //                         {event.participants.join(', ')}
    //                       </div>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             ) : (
    //               <p className="text-gray-500 text-sm">No events scheduled for this date.</p>
    //             )}
    //           </div>
              
    //           {/* Quick Actions */}
    //           <div className="bg-white rounded-lg shadow p-4">
    //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    //             <div className="space-y-2">
    //               <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
    //                 Schedule Tutoring Session
    //               </button>
    //               <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
    //                 Create Study Group
    //               </button>
    //               <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
    //                 Set Reminder
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
      
    //   {/* Event Modal */}
    //   <EventModal />
    // </div>
    <EventCalendar/>
  )
}

export default CalendarPage