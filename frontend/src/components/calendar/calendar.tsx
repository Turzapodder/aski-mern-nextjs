import React from "react";
import { CalendarBody } from "@/components/calendar/calendar-body";
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import { getEvents, getUsers } from "@/components/calendar/requests";

async function getCalendarData() {
	return {
		events: await getEvents(),
		users: await getUsers(),
	};
}

export async function Calendar() {
	const { events, users } = await getCalendarData();

	return (
		<CalendarProvider events={events} users={users} view="month">
			<DndProvider showConfirmation={false}>
				<div className="w-full border rounded-xl">
					<CalendarHeader />
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}
