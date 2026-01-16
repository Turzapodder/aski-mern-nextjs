"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { MoreHorizontal, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type AssignmentRow = Record<string, any>

const statusTone = (status?: string) => {
  switch (status) {
    case "pending":
      return "bg-blue-100 text-blue-700"
    case "assigned":
    case "submitted":
      return "bg-amber-100 text-amber-700"
    case "completed":
      return "bg-emerald-100 text-emerald-700"
    case "disputed":
      return "bg-rose-100 text-rose-700"
    case "cancelled":
      return "bg-gray-200 text-gray-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export default function AdminAssignmentsPage() {
  const router = useRouter()
  const [status, setStatus] = useState("all")
  const [subject, setSubject] = useState("")
  const [minBudget, setMinBudget] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"delete" | "force-cancel">("delete")
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      status,
      subject: subject.trim() || undefined,
      minBudget: minBudget || undefined,
      maxBudget: maxBudget || undefined,
    }),
    [maxBudget, minBudget, page, status, subject]
  )

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-assignments", params],
    () => adminApi.assignments.getAll(params)
  )

  const assignments = data?.data ?? []
  const pagination = data?.pagination

  const openDialog = (assignment: AssignmentRow, mode: "delete" | "force-cancel") => {
    setSelectedAssignment(assignment)
    setDialogMode(mode)
    setReason("")
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedAssignment?._id) return
    setIsSubmitting(true)
    try {
      if (dialogMode === "delete") {
        await adminApi.assignments.delete(selectedAssignment._id, reason)
        toast.success("Assignment deleted")
      } else {
        await adminApi.assignments.forceCancel(selectedAssignment._id, reason)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
        <p className="text-sm text-gray-500">Review global assignments and moderate activity.</p>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-semibold">Marketplace feed</CardTitle>
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Open</SelectItem>
                <SelectItem value="assigned">In progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject"
            />
            <Input
              value={minBudget}
              onChange={(event) => setMinBudget(event.target.value)}
              placeholder="Min budget"
            />
            <Input
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value)}
              placeholder="Max budget"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load assignments.
            </div>
          )}

          {!isLoading && !error && assignments.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No assignments match the current filters.
            </div>
          )}

          {!isLoading && !error && assignments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Student</th>
                    <th className="py-3 pr-4">Subject</th>
                    <th className="py-3 pr-4">Budget</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Posted</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((assignment: AssignmentRow) => (
                    <tr key={assignment._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 font-medium text-gray-900">{assignment.title}</td>
                      <td className="py-3 pr-4 text-gray-600">{assignment.student?.name || "N/A"}</td>
                      <td className="py-3 pr-4 text-gray-600">{assignment.subject}</td>
                      <td className="py-3 pr-4 text-gray-700">
                        {assignment.estimatedCost || assignment.paymentAmount || 0}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/assignments/${assignment._id}`)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(assignment, "force-cancel")} className="text-amber-600">
                              <XCircle className="h-4 w-4" />
                              Force cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(assignment, "delete")} className="text-rose-600">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "delete" ? "Delete assignment" : "Force cancel assignment"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "delete"
                ? "This removes the assignment from the marketplace."
                : "This will cancel the assignment and move escrow funds back to the student."}
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
              {dialogMode === "delete" ? "Delete assignment" : "Force cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
