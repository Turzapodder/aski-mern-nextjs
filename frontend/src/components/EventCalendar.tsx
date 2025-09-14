import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import EventCard, { CalendarEvent } from '@/components/EventCard';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

// CalendarEvent interface is now imported from EventCard component

type ViewType = 'week';

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Sample event data with more multi-date spanning events
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Redesign Dashboard UI',
      description: 'Redesign Your Dashboard UI for a More Intuitive Experience.',
      startDate: new Date(2025, 8, 28), // March 28, 2025
      endDate: new Date(2025, 8, 30),
      status: 'progress',
      team: [
        { id: '1', name: 'John Doe', avatar: '👨‍💻' },
        { id: '2', name: 'Jane Smith', avatar: '👩‍🎨' },
        { id: '3', name: 'Mike Johnson', avatar: '👨‍🔬' }
      ],
      progress: 75
    },
    {
      id: '2',
      title: 'CRM Dashboard',
      description: 'Make your CRM work smarter with our easy-to-use Dashboard UI.',
      startDate: new Date(2025, 8, 30),
      endDate: new Date(2025, 9, 2), // Spans 4 days
      status: 'progress',
      team: [
        { id: '4', name: 'Sarah Wilson', avatar: '👩‍💼' },
        { id: '5', name: 'Tom Brown', avatar: '👨‍💻' }
      ],
      progress: 60
    },
    {
      id: '3',
      title: 'Finance Mobile UI',
      description: 'Streamline Your Finances with Our Mobile UI.',
      startDate: new Date(2025, 8, 5),
      endDate: new Date(2025, 8, 8), // Spans 4 days
      status: 'completed',
      team: [
        { id: '6', name: 'Emma Davis', avatar: '👩‍💻' },
        { id: '7', name: 'Alex Johnson', avatar: '👨‍🎨' },
        { id: '8', name: 'Lisa Chen', avatar: '👩‍🔬' }
      ],
      progress: 100
    },
    {
      id: '4',
      title: 'Redesign Finance Mobile UI',
      description: 'Streamline your finance mobile UI for a streamlined experience.',
      startDate: new Date(2025, 8, 1),
      endDate: new Date(2025, 8, 5), // Spans 5 days
      status: 'progress',
      team: [
        { id: '9', name: 'Chris Wilson', avatar: '👨‍💻' },
        { id: '10', name: 'Amy Taylor', avatar: '👩‍🎨' }
      ],
      progress: 45
    },
    {
      id: '5',
      title: 'Marketplace Mobile UI',
      description: 'Unlock the power of the marketplace with our mobile app.',
      startDate: new Date(2025, 8, 3), // September 3, 2025
      endDate: new Date(2025, 9, 7), // September 7, 2025 (5 days)
      status: 'progress',
      team: [
        { id: '11', name: 'Ryan Miller', avatar: '👨‍💼' },
        { id: '12', name: 'Sophie Anderson', avatar: '👩‍💻' },
        { id: '13', name: 'Alex Chen', avatar: '👨‍🎨' }
      ],
      progress: 65
    },
    {
      id: '6',
      title: 'Usability Testing',
      description: 'Ensure your user interface is optimized with usability.',
      startDate: new Date(2025, 8, 9), // September 9, 2025
      endDate: new Date(2025, 8, 13), // September 13, 2025 (5 days)
      status: 'pending',
      team: [
        { id: '13', name: 'David Lee', avatar: '👨‍🔬' },
        { id: '14', name: 'Maria Garcia', avatar: '👩‍💼' }
      ]
    },
    {
      id: '7',
      title: 'Dashboard UI Exploration',
      description: 'Create an exploration design dashboard UI that helps users navigate efficiently.',
      startDate: new Date(2025, 8, 6),
      endDate: new Date(2025, 8, 12), // Spans 7 days
      status: 'progress',
      team: [
        { id: '15', name: 'Kevin Zhang', avatar: '👨‍💻' },
        { id: '16', name: 'Rachel Green', avatar: '👩‍🎨' }
      ],
      progress: 30
    },
    {
      id: '8',
      title: 'User Research Initiative',
      description: 'Discover the Benefits of Research with Our User Interface methodology.',
      startDate: new Date(2025, 8, 10),
      endDate: new Date(2025, 8, 16), // Spans 7 days
      status: 'pending',
      team: [
        { id: '17', name: 'James White', avatar: '👨‍🔬' },
        { id: '18', name: 'Nicole Brown', avatar: '👩‍💼' },
        { id: '19', name: 'Sam Taylor', avatar: '👨‍💻' }
      ]
    },
    {
      id: '9',
      title: 'Mobile App Development Sprint',
      description: 'Complete mobile application development with cross-platform compatibility.',
      startDate: new Date(2025, 8, 2),
      endDate: new Date(2025, 8, 15), // Spans 14 days
      status: 'progress',
      team: [
        { id: '20', name: 'Lisa Wang', avatar: '👩‍💻' },
        { id: '21', name: 'Mark Johnson', avatar: '👨‍💼' },
        { id: '22', name: 'Anna Kim', avatar: '👩‍🎨' },
        { id: '23', name: 'Carlos Rodriguez', avatar: '👨‍🔬' }
      ],
      progress: 55
    },
    {
      id: '10',
      title: 'Backend API Integration',
      description: 'Integrate all frontend components with backend services and APIs.',
      startDate: new Date(2025, 8, 11),
      endDate: new Date(2025, 8, 20), // Spans 10 days  
      status: 'progress',
      team: [
        { id: '24', name: 'Michael Brown', avatar: '👨‍💻' },
        { id: '25', name: 'Sarah Johnson', avatar: '👩‍💼' }
      ],
      progress: 40
    }
  ];

  const getDaysInView = useMemo(() => {
    if (viewType === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewType]);

  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (viewType === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      day.setHours(12, 0, 0, 0);
      return day >= eventStart && day <= eventEnd;
    });
  };

  const getEventSpanDays = (event: CalendarEvent) => {
    if(getDaysInView) {
      const start = new Date(Math.max(event.startDate.getTime(), getDaysInView[0].getTime()));
      const end = new Date(Math.min(event.endDate.getTime(), getDaysInView[getDaysInView.length - 1].getTime()));
      
      return eachDayOfInterval({ start, end }).filter(day => 
        getDaysInView.some(viewDay => isSameDay(day, viewDay))
      );
    }
  };

  const isEventStartDay = (event: CalendarEvent, day: Date) => {
    if(getDaysInView) {
      return isSameDay(event.startDate, day) || isSameDay(getDaysInView[0], day);
    }
  };

  // Status color function moved to EventCard component

  const formatDateHeader = () => {
    if (viewType === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <div className="w-full h-full bg-calendar-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-red bg-calendar-card border-b border-calendar-border-light">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-calendar-text-primary">Event Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewType('week')}
              className={viewType === 'week' ? 'bg-primary text-primary-foreground' : ''}
            >
              Week
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-calendar-text-primary min-w-[180px] text-center">
              {formatDateHeader()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Date Headers */}
          <div className="flex border-b border-calendar-border-light bg-calendar-card">
            {getDaysInView?.map((day, index) => (
              <div
                key={index}
                className={`flex-1 min-w-[140px] p-4 text-center border-r border-calendar-border-light last:border-r-0 ${
                  isToday(day) ? 'bg-primary/10' : ''
                }`}
              >
                <div className="text-xs font-medium text-calendar-text-muted uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-sm font-semibold mt-1 ${
                  isToday(day) 
                    ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                    : 'text-calendar-text-primary'
                }`}>
                  {format(day, 'dd')}
                </div>
              </div>
            ))}
          </div>

          {/* Events Grid */}
          <div className="relative">
            <div className="flex min-h-[600px]">
              {getDaysInView?.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="flex-1 min-w-[140px] border-r border-calendar-border-light last:border-r-0 p-2"
                >
                  <div className="space-y-2 relative">
                    {/* Group events by their vertical position to handle overlaps */}
                    {(() => {
                      const dayEvents = getEventsForDay(day);
                      
                      // Sort events by start date and then by duration (shorter events first)
                      const sortedEvents = [...dayEvents].sort((a, b) => {
                        // First sort by start date
                        const dateCompare = a.startDate.getTime() - b.startDate.getTime();
                        if (dateCompare !== 0) return dateCompare;
                        
                        // Then by duration (shorter events first)
                        const aDuration = a.endDate.getTime() - a.startDate.getTime();
                        const bDuration = b.endDate.getTime() - b.startDate.getTime();
                        return aDuration - bDuration;
                      });
                      
                      return sortedEvents.map((event, eventIndex) => {
                        const spanDays = getEventSpanDays(event);
                        const isStartDay = isEventStartDay(event, day);
                        const daySpan = spanDays?.length;
                        console.log(eventIndex)
                        return (
                          <EventCard
                            key={`${event.id}-${dayIndex}`}
                            event={event}
                            daySpan={daySpan}
                            isStartDay={isStartDay}
                            index={eventIndex} // Pass the index for sequential positioning
                            onClick={setSelectedEvent}
                          />
                        );
                      });
                    })()} 
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md bg-slate-200">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium text-calendar-text-muted">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Odatask / {selectedEvent && selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEvent(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-calendar-text-primary mb-2">
                  {selectedEvent.title}
                </h2>
                <p className="text-sm text-calendar-text-secondary">
                  {selectedEvent.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-calendar-text-secondary">
                <Clock className="w-4 h-4" />
                <span>
                  {format(selectedEvent.startDate, 'EEE, dd')} - {format(selectedEvent.endDate, 'EEE, dd')}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-calendar-text-primary">Task Progress</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-calendar-text-primary">
                      Competitor research marketplace mobile
                    </span>
                  </div>
                  
                  <div className="ml-7 text-xs text-calendar-text-muted">
                    Build wireframe with UX Designer
                  </div>
                  
                  <div className="ml-7 text-xs text-calendar-text-muted">
                    High Fidelity Design
                  </div>
                </div>

                {selectedEvent.progress && (
                  <div className="ml-7 mt-2">
                    <div className="w-full h-1.5 bg-calendar-border-light rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${selectedEvent.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-calendar-text-muted mt-1">
                      {selectedEvent.progress}% Complete
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-calendar-text-primary">Assignees</h3>
                <div className="flex items-center gap-1">
                  {selectedEvent.team.map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-calendar-card"
                      title={member.name}
                    >
                      <span className="text-sm">{member.avatar}</span>
                    </div>
                  ))}
                  {selectedEvent.team.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-calendar-text-muted/20 flex items-center justify-center text-xs border-2 border-calendar-card">
                      +{selectedEvent.team.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventCalendar;