"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { FileText, User } from "lucide-react"
import { toast } from "sonner"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type AssignmentDetails = {
  assignment?: Record<string, any>
  chatHistory?: Record<string, any>[]
}

const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export default function AdminAssignmentDetailsPage() {
  const params = useParams<{ id: string }>()
  const assignmentId = params?.id
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"delete" | "force-cancel">("delete")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    assignmentId ? ["admin-assignment", assignmentId] : null,
    () => adminApi.assignments.getById(assignmentId)
  )

  const payload = data?.data as AssignmentDetails | undefined
  const assignment = payload?.assignment
  const chatHistory = payload?.chatHistory ?? []

  const openDialog = (mode: "delete" | "force-cancel") => {
    setDialogMode(mode)
    setReason("")
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!assignment?._id) return
    setIsSubmitting(true)
    try {
      if (dialogMode === "delete") {
        await adminApi.assignments.delete(assignment._id, reason)
        toast.success("Assignment deleted")
      } else {
        await adminApi.assignments.forceCancel(assignment._id, reason)
        toast.success("Assignment cancelled")
      }
      setDialogOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Action failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Unable to load assignment details.
      </div>
    )
  }

  const attachments = assignment.attachments || []
  const submissions = assignment.submissionDetails?.submissionFiles || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{assignment.title}</h1>
        <p className="text-sm text-gray-500">Assignment detail view and moderation controls.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Assignment info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>{assignment.description}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-medium text-gray-900">
                    {assignment.estimatedCost || assignment.paymentAmount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(assignment.deadline)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{assignment.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(assignment.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Participants</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <User className="h-4 w-4" />
                  Student
                </div>
                <p className="text-sm text-gray-600">{assignment.student?.name || "N/A"}</p>
                <p className="text-xs text-gray-500">{assignment.student?.email || ""}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <User className="h-4 w-4" />
                  Tutor
                </div>
                <p className="text-sm text-gray-600">{assignment.assignedTutor?.name || "Unassigned"}</p>
                <p className="text-xs text-gray-500">{assignment.assignedTutor?.email || ""}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Files & deliverables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Student attachments</p>
                {attachments.length === 0 && <p className="text-sm text-gray-500">No attachments.</p>}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file: Record<string, any>) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary"
                      >
                        <FileText className="h-4 w-4" />
                        {file.originalName || file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Tutor submissions</p>
                {submissions.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
                {submissions.length > 0 && (
                  <div className="space-y-2">
                    {submissions.map((file: Record<string, any>) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary"
                      >
                        <FileText className="h-4 w-4" />
                        {file.originalName || file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Chat history</CardTitle>
            </CardHeader>
            <CardContent>
              {chatHistory.length === 0 && <p className="text-sm text-gray-500">No messages recorded.</p>}
              {chatHistory.length > 0 && (
                <ScrollArea className="h-64 rounded-lg border border-gray-200 p-3">
                  <div className="space-y-3">
                    {chatHistory.map((message: Record<string, any>) => (
                      <div key={message._id} className="rounded-lg border border-gray-100 p-3 text-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          {message.sender?.name || "User"} | {formatDate(message.createdAt)}
                        </p>
                        <p className="text-gray-700">{message.content || "Attachment"}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200/70 bg-white/90 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Admin actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => openDialog("force-cancel")}>
              Force cancel
            </Button>
            <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => openDialog("delete")}>
              Delete assignment
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "delete" ? "Delete assignment" : "Force cancel assignment"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "delete"
                ? "This removes the assignment permanently."
                : "This cancels the assignment and refunds escrow to the student."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for this action"
            rows={3}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={dialogMode === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}
              disabled={isSubmitting || reason.trim().length === 0}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
