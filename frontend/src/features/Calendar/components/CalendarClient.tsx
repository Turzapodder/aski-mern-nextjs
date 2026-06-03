'use client';

import React from 'react';
import { CalendarBody } from '@/components/calendar/calendar-body';
import { CalendarProvider } from '@/components/calendar/contexts/calendar-context';
import { DndProvider } from '@/components/calendar/contexts/dnd-context';
import { CalendarHeader } from '@/components/calendar/header/calendar-header';
import { CalendarSkeleton } from '@/components/calendar/skeletons/calendar-skeleton';
import { useCalendarLogic } from '../hooks/useCalendarLogic';

export const CalendarClient = () => {
  const { events, users, loading, error } = useCalendarLogic();

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Your Timeline & Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your assignments, deadlines, and live booked session appointments in one unified view.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <CalendarProvider events={events} users={users} view="month">
          <DndProvider showConfirmation={false}>
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden bg-white">
              <CalendarHeader />
              <CalendarBody />
            </div>
          </DndProvider>
        </CalendarProvider>
      </div>

      {!error && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center bg-gray-50/50">
          <p className="text-sm font-semibold text-gray-900">Your calendar is clear</p>
          <p className="mt-1 text-xs text-gray-500">No active assignment deadlines or session appointments found.</p>
        </div>
      )}
    </div>
  );
};
