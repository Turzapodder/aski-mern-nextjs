import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

// Define the team member interface
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

// Define the event interface
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  team: TeamMember[];
  progress?: number;
}

// Define props for the EventCard component
interface EventCardProps {
  event: CalendarEvent;
  daySpan: number | undefined;
  isStartDay: boolean | undefined;
  index: number; // Used for positioning overlapping events
  onClick: (event: CalendarEvent) => void;
}

// Function to generate a random pastel color
const getRandomPastelColor = () => {
  // Generate a random hue (0-360)
  const hue = Math.floor(Math.random() * 360);
  // Use high saturation and lightness for pastel colors
  return `hsl(${hue}, 70%, 85%)`;
};

// Cache colors by event ID to ensure consistency
const eventColors: Record<string, string> = {};

// Function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'progress': return 'bg-status-progress';
    case 'completed': return 'bg-status-completed';
    case 'pending': return 'bg-status-pending';
    case 'cancelled': return 'bg-status-cancelled';
    default: return 'bg-status-progress';
  }
};

const EventCard: React.FC<EventCardProps> = ({ event, daySpan, isStartDay, index, onClick }) => {
  // Get or generate a color for this event
  if (!eventColors[event.id]) {
    eventColors[event.id] = getRandomPastelColor();
  }
  const backgroundColor = eventColors[event.id];
  
  // If this isn't the start day of the event and we're in a multi-day view, don't render
  if (!isStartDay) return null;

  // If daySpan is undefined, default to 1
  const spanDays = daySpan ?? 1;

  return (
    <div
      className={`relative rounded-lg border border-calendar-border-light shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${spanDays > 1 ? 'mr-2' : ''}`}
      style={{
        width: spanDays ? (spanDays > 1 ? `calc(${spanDays * 100}% + ${(spanDays - 1) * 8}px)` : '100%') : '100%',
        backgroundColor,
        marginTop: `${(index * 128)+(index*10)}px`, // Add vertical offset for overlapping events
        zIndex: 10 - index, // Higher index = lower z-index
      }}
      onClick={() => onClick(event)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex -space-x-1">
                {event.team.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xs border-2 border-white z-10"
                    title={member.name}
                  >
                    {member.avatar}
                  </div>
                ))}
                {event.team.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-calendar-text-muted/20 flex items-center justify-center text-xs border-2 border-white">
                    +{event.team.length - 3}
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-sm text-calendar-text-primary line-clamp-1 mb-1">
              {event.title}
            </h3>
            <p className="text-xs text-calendar-text-secondary line-clamp-2">
              {event.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Badge 
            variant="secondary" 
            className={`text-xs px-2 py-1 ${getStatusColor(event.status)} text-white border-0`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          
          {event.progress !== undefined && (
            <div className="flex items-center gap-1">
              <div className="w-12 h-1.5 bg-calendar-border-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
              <span className="text-xs text-calendar-text-muted">
                {event.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;