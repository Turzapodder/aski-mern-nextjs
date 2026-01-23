"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type ResolutionSummary = {
  resolutionType: "refund" | "release" | "split"
  escrowAmount: number
  studentAmount: number
  tutorAmount: number
  platformFee: number
}

type ResolveDisputeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: ResolutionSummary
  isSubmitting?: boolean
  onConfirm: (note?: string) => Promise<void> | void
}

const ResolveDisputeModal = ({
  open,
  onOpenChange,
  summary,
  isSubmitting,
  onConfirm,
}: ResolveDisputeModalProps) => {
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) {
      setNote("")
    }
  }, [open])

  const handleConfirm = async () => {
    await onConfirm(note.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
          <DialogDescription>Review the breakdown before confirming this decision.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Resolution: <span className="font-semibold">{summary.resolutionType}</span></p>
          <p>Escrow amount: <span className="font-semibold">{summary.escrowAmount}</span></p>
          <p>Student amount: <span className="font-semibold">{summary.studentAmount}</span></p>
          <p>Tutor amount: <span className="font-semibold">{summary.tutorAmount}</span></p>
          <p>Platform fee: <span className="font-semibold">{summary.platformFee}</span></p>
        </div>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note for the parties"
          rows={3}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Resolving..." : "Resolve dispute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ResolveDisputeModal
