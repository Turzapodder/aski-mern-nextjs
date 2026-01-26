"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AssignmentDetails = {
  assignment?: Record<string, any>
  chat?: Record<string, any>
  chatHistory?: Record<string, any>[]
  proposals?: Record<string, any>[]
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
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    status: "",
    budget: "",
    deadline: ""
  })

  const { data, error, isLoading, mutate } = useSWR(
    assignmentId ? ["admin-assignment", assignmentId] : null,
    () => adminApi.assignments.getById(assignmentId)
  )

  const payload = data?.data as AssignmentDetails | undefined
  const assignment = payload?.assignment
  const chat = payload?.chat
  const chatHistory = payload?.chatHistory ?? []
  const proposals = payload?.proposals ?? []

  useEffect(() => {
    if (assignment) {
      const deadline = assignment.deadline ? new Date(assignment.deadline) : null
      setFormData({
        title: assignment.title || "",
        description: assignment.description || "",
        subject: assignment.subject || "",
        status: assignment.status || "pending",
        budget: String(assignment.budget ?? assignment.estimatedCost ?? ""),
        deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline.toISOString().slice(0, 10) : ""
      })
    }
  }, [assignment])

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

  const handleSave = async () => {
    if (!assignment?._id) return
    const budgetValue = Number(formData.budget)
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      toast.error("Budget must be a positive number")
      return
    }
    setIsSaving(true)
    try {
      await adminApi.assignments.update(assignment._id, {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        status: formData.status,
        budget: budgetValue,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      })
      toast.success("Assignment updated")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Update failed")
    } finally {
      setIsSaving(false)
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
  const submissionFiles = assignment.submissionDetails?.submissionFiles || []
  const submissionLinks = assignment.submissionDetails?.submissionLinks || []
  const submissionNotes = assignment.submissionDetails?.submissionNotes
  const submissionHistory = assignment.submissionHistory || []
  const chatParticipants = Array.isArray(chat?.participants) ? chat?.participants : []
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000"
  const resolveFileUrl = (url?: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${apiBaseUrl}${url}`
  }

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
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Title</p>
                  <Input
                    value={formData.title}
                    onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Subject</p>
                  <Input
                    value={formData.subject}
                    onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">Description</p>
                <Textarea
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Budget</p>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(event) => setFormData((prev) => ({ ...prev, budget: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Deadline</p>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Status</p>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="proposal_received">Proposal received</SelectItem>
                      <SelectItem value="proposal_accepted">Proposal accepted</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="submission_pending">Submission pending</SelectItem>
                      <SelectItem value="revision_requested">Revision requested</SelectItem>
                      <SelectItem value="pending">Pending (legacy)</SelectItem>
                      <SelectItem value="assigned">Assigned (legacy)</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Payment status</p>
                  <p className="text-sm text-gray-700 capitalize">{assignment.paymentStatus || "pending"}</p>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Payment amount</p>
                  <p className="text-sm text-gray-700">
                    {assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0}
                  </p>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Chat ID</p>
                  <p className="text-sm text-gray-700">{assignment.chatId || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created {formatDate(assignment.createdAt)}</span>
                <Button onClick={handleSave} disabled={isSaving} className="bg-primary-600 hover:bg-primary-700">
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
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
                        href={resolveFileUrl(file.url)}
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
                {submissionFiles.length === 0 && submissionLinks.length === 0 && !submissionNotes && (
                  <p className="text-sm text-gray-500">No submissions yet.</p>
                )}
                {submissionFiles.length > 0 && (
                  <div className="space-y-2">
                    {submissionFiles.map((file: Record<string, any>) => (
                      <a
                        key={file.url}
                        href={resolveFileUrl(file.url)}
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
                {submissionLinks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {submissionLinks.map((link: Record<string, any>) => (
                      <a
                        key={link.url}
                        href={resolveFileUrl(link.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary"
                      >
                        <FileText className="h-4 w-4" />
                        {link.label || link.url}
                      </a>
                    ))}
                  </div>
                )}
                {submissionNotes && (
                  <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{submissionNotes}</p>
                )}
                {submissionHistory.length > 1 && (
                  <div className="mt-4 space-y-2">
                    {submissionHistory.map((entry: Record<string, any>, index: number) => (
                      <div key={`${entry.submittedAt || "history"}-${index}`} className="rounded-lg border border-gray-100 p-3 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Revision {entry.revisionIndex ?? index + 1}</span>
                          <span>{formatDate(entry.submittedAt)}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">
                          {(entry.submissionFiles?.length || 0)} files, {(entry.submissionLinks?.length || 0)} links
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 && <p className="text-sm text-gray-500">No proposals yet.</p>}
              {proposals.length > 0 && (
                <div className="space-y-3">
                  {proposals.map((proposal: Record<string, any>) => (
                    <div key={proposal._id} className="rounded-lg border border-gray-100 p-3 text-sm text-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {proposal.tutor?.name || "Tutor"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {proposal.title || "Proposal"} - {formatDate(proposal.createdAt || proposal.submittedAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                          {proposal.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Price: {proposal.proposedPrice ?? 0} - ETA: {proposal.estimatedDeliveryTime ?? 0} hrs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Chat history</CardTitle>
            </CardHeader>
            <CardContent>
              {chat && (
                <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{chat.name || "Assignment chat"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Participants: {chatParticipants.length || 0}
                  </p>
                  {chatParticipants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {chatParticipants.map((participant: Record<string, any>) => (
                        <span
                          key={participant.user?._id || participant._id}
                          className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700"
                        >
                          {participant.user?.name || "User"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {chatHistory.length === 0 && (
                <p className="text-sm text-gray-500">
                  {chat ? "No messages recorded yet." : "No chat found for this assignment."}
                </p>
              )}
              {chatHistory.length > 0 && (
                <ScrollArea className="h-72 rounded-lg border border-gray-200 p-3">
                  <div className="space-y-3">
                    {chatHistory.map((message: Record<string, any>) => {
                      const attachments = Array.isArray(message.attachments)
                        ? message.attachments
                        : [];
                      const isOffer = message.type === "offer";
                      const offerMeta = message.meta || {};
                      return (
                        <div key={message._id} className="rounded-lg border border-gray-100 bg-white p-3 text-sm">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>{message.sender?.name || "User"}</span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          {message.content && (
                            <p className="text-gray-700 whitespace-pre-line">{message.content}</p>
                          )}
                          {isOffer && (
                            <div className="mt-2 rounded-lg border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-700">
                              <p className="font-semibold">Custom offer</p>
                              <p className="mt-1">
                                Budget: {offerMeta.proposedBudget ?? offerMeta.budget ?? "N/A"}
                              </p>
                              <p>
                                Deadline: {offerMeta.proposedDeadline ? formatDate(offerMeta.proposedDeadline) : "N/A"}
                              </p>
                              {offerMeta.message && (
                                <p className="mt-1 text-purple-600">{offerMeta.message}</p>
                              )}
                            </div>
                          )}
                          {attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {attachments.map((file: Record<string, any>) => (
                                <a
                                  key={file.url}
                                href={resolveFileUrl(file.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-xs text-primary"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {file.originalName || file.filename}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
