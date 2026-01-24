"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useCreateReportMutation } from "@/lib/services/reports"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const REPORT_REASONS = [
  "Spam or misleading",
  "Harassment or hate speech",
  "Inappropriate content",
  "Fraud or scam",
  "Low quality or irrelevant",
  "Other",
]

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reporterType: "user" | "tutor"
  reportedType: "assignment" | "tutorProfile" | "userProfile"
  reportedId: string
}

const ReportModal = ({ isOpen, onClose, reporterType, reportedType, reportedId }: ReportModalProps) => {
  const [reason, setReason] = useState("")
  const [comments, setComments] = useState("")
  const [createReport, { isLoading }] = useCreateReportMutation()

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason")
      return
    }
    try {
      await createReport({
        reporterType,
        reportedType,
        reportedId,
        reason,
        comments: comments || undefined,
      }).unwrap()
      toast.success("Report submitted")
      setReason("")
      setComments("")
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to submit report")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Additional details (optional)"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              Submit report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReportModal;
