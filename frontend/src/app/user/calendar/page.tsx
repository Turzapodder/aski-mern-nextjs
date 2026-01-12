'use client'

import { useEffect, useState } from "react"
import { CalendarBody } from "@/components/calendar/calendar-body"
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context"
import { DndProvider } from "@/components/calendar/contexts/dnd-context"
import { CalendarHeader } from "@/components/calendar/header/calendar-header"
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton"
import type { IEvent, IUser } from "@/components/calendar/interfaces"

type AssignmentCalendarItem = {
  id: string
  title: string
  deadline: string
  status: string
  assignedTutorName?: string
  studentName?: string
}

type SessionCalendarItem = {
  id: string
  tutorName?: string
  studentName?: string
  scheduledTime: string
  duration: number
  subject: string
}

const createUserId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

export default function CalendarPage() {
  const [events, setEvents] = useState<IEvent[]>([])
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendarData = async () => {
    setLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const token = localStorage.getItem("accessToken")
      const headers: Record<string, string> = {}

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const [assignmentsRes, sessionsRes] = await Promise.all([
        fetch(`${baseUrl}/api/assignments/me?status=IN_PROGRESS`, {
          headers,
          credentials: "include"
        }),
        fetch(`${baseUrl}/api/sessions/upcoming`, {
          headers,
          credentials: "include"
        })
      ])

      if (!assignmentsRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to load calendar data")
      }

      const assignmentsPayload = await assignmentsRes.json()
      const sessionsPayload = await sessionsRes.json()

      if (!assignmentsPayload?.success || !sessionsPayload?.success) {
        throw new Error("Failed to load calendar data")
      }

      const assignments: AssignmentCalendarItem[] = Array.isArray(
        assignmentsPayload.data
      )
        ? assignmentsPayload.data
        : []
      const sessions: SessionCalendarItem[] = Array.isArray(
        sessionsPayload.data
      )
        ? sessionsPayload.data
        : []

      const userMap = new Map<string, IUser>()
      const ensureUser = (name: string) => {
        const safeName = name || "Unknown"
        if (!userMap.has(safeName)) {
          userMap.set(safeName, {
            id: createUserId(safeName),
            name: safeName,
            picturePath: null
          })
        }
        return userMap.get(safeName)!
      }

      const mergedEvents: IEvent[] = []
      let eventId = 1

      assignments.forEach((assignment) => {
        if (!assignment.deadline) return
        const deadline = new Date(assignment.deadline)
        if (Number.isNaN(deadline.getTime())) return

        const counterpart =
          assignment.assignedTutorName || assignment.studentName || "Assignment"

        mergedEvents.push({
          id: eventId++,
          startDate: deadline.toISOString(),
          endDate: deadline.toISOString(),
          title: assignment.title,
          color: "red",
          description: `Deadline with ${counterpart}`,
          user: ensureUser(counterpart)
        })
      })

      sessions.forEach((session) => {
        if (!session.scheduledTime) return
        const startDate = new Date(session.scheduledTime)
        if (Number.isNaN(startDate.getTime())) return
        const durationMinutes = Number(session.duration) || 60
        const endDate = new Date(
          startDate.getTime() + durationMinutes * 60 * 1000
        )

        const counterpart =
          session.tutorName || session.studentName || "Student"

        mergedEvents.push({
          id: eventId++,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          title: `Session with ${counterpart}`,
          color: "blue",
          description: session.subject,
          user: ensureUser(counterpart)
        })
      })

      setEvents(mergedEvents)
      setUsers(Array.from(userMap.values()))
    } catch (fetchError: any) {
      setError(fetchError?.message || "Unable to load calendar data")
      setEvents([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarData()
  }, [])

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
