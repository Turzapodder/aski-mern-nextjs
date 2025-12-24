import React, { Suspense } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <div className="container mx-auto py-10 flex justify-center">
        <Calendar
          mode="single"
          className="rounded-md border shadow"
        />
      </div>
    </Suspense>
  );
}