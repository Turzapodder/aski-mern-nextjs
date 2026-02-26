import React, { Suspense } from "react"
import { CalendarClient } from "./CalendarClient"
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton"

export const metadata = {
  title: "Calendar | Aski",
  description: "View your timeline and schedule",
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarClient />
    </Suspense>
  )
}
