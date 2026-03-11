export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  team: {
    id: string;
    name: string;
    avatar: string;
  }[];
  progress?: number;
}

export type AssignmentCalendarItem = {
  id: string;
  title: string;
  deadline: string;
  status: string;
  assignedTutorName?: string;
  studentName?: string;
};

export type SessionCalendarItem = {
  id: string;
  tutorName?: string;
  studentName?: string;
  scheduledTime: string;
  duration: number;
  subject: string;
};
