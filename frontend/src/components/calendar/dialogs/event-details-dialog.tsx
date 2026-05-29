'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Text, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalendar } from '@/components/calendar/contexts/calendar-context';
import { AddEditEventDialog } from '@/components/calendar/dialogs/add-edit-event-dialog';
import { formatTime } from '@/components/calendar/helpers';
import type { IEvent } from '@/components/calendar/interfaces';

interface IProps {
  event: IEvent;
  children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const { use24HourFormat, removeEvent } = useCalendar();

  const deleteEvent = (eventId: number) => {
    try {
      removeEvent(eventId);
      toast.success('Event deleted successfully.');
    } catch {
      toast.error('Error deleting event.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{event.title}</span>
            {event.status && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 capitalize">
                {event.status.replace('_', ' ')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Counterparty</p>
                <p className="text-sm text-muted-foreground">{event.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, 'EEEE dd MMMM')}
                  <span className="mx-1">at</span>
                  {formatTime(parseISO(event.startDate), use24HourFormat)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date/Deadline</p>
                <p className="text-sm text-muted-foreground">
                  {format(endDate, 'EEEE dd MMMM')}
                  <span className="mx-1">at</span>
                  {formatTime(parseISO(event.endDate), use24HourFormat)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Summary / Description</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2">
          {event.redirectUrl ? (
            <Button asChild className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2 rounded-xl transition-all">
              <a href={event.redirectUrl}>
                {event.type === 'session' ? 'Go to Messages / Live Session' : 'View Assignment Details'}
              </a>
            </Button>
          ) : (
            <>
              <AddEditEventDialog event={event}>
                <Button variant="outline">Edit</Button>
              </AddEditEventDialog>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteEvent(event.id);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
