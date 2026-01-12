import React, { Suspense } from "react";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";
import { Calendar } from "@/components/calendar/calendar";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <div className="container mx-auto py-10 flex justify-center">
        <Calendar />
      </div>
    </Suspense>
  );
}