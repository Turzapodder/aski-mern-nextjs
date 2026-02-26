"use client"

import React from "react"
import { CalendarBody } from "@/components/calendar/calendar-body"
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context"
import { DndProvider } from "@/components/calendar/contexts/dnd-context"
import { CalendarHeader } from "@/components/calendar/header/calendar-header"
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton"
import { useCalendarLogic } from "./useCalendarLogic"

export const CalendarClient = () => {
  const {
    events,
    users,
    loading,
    error
  } = useCalendarLogic();

  if (loading) {
    return <CalendarSkeleton />
  }

  return (
    <div className="container mx-auto py-10 flex flex-col gap-6">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <CalendarProvider events={events} users={users} view="month">
        <DndProvider showConfirmation={false}>
          <div className="w-full border rounded-xl">
            <CalendarHeader />
            <CalendarBody />
          </div>
        </DndProvider>
      </CalendarProvider>

      {!error && events.length === 0 && (
        <div className="text-sm text-gray-500">
          No upcoming deadlines or sessions
        </div>
      )}
    </div>
  )
}
