"use client"

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type BanUserModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "ban" | "unban"
  userName?: string
  isSubmitting?: boolean
  onConfirm: (reason?: string) => Promise<void> | void
}

const BanUserModal = ({
  open,
  onOpenChange,
  mode,
  userName,
  isSubmitting,
  onConfirm,
}: BanUserModalProps) => {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!open) {
      setReason("")
    }
  }, [open])

  const handleConfirm = async () => {
    await onConfirm(mode === "ban" ? reason.trim() : undefined)
  }

  const isBan = mode === "ban"
  const title = isBan ? "Ban user" : "Unban user"
  const description = isBan
    ? "This will suspend the user from accessing the platform."
    : "This will restore the user's access to the platform."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isBan && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Reason for banning {userName || "this user"}.</p>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Provide a short reason for the ban"
              rows={4}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            type="button"
            className={isBan ? "bg-rose-600 hover:bg-rose-700" : ""}
            disabled={isSubmitting || (isBan && reason.trim().length === 0)}
          >
            {isSubmitting ? "Saving..." : isBan ? "Ban user" : "Unban user"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BanUserModal
