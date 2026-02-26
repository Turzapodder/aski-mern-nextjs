"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// ── Custom Offer Dialog ──────────────────────────────────────────────────────
interface ChatOfferModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    budget: string
    deadline: string
    note: string
    error: string
    isLoading: boolean
    onBudgetChange: (v: string) => void
    onDeadlineChange: (v: string) => void
    onNoteChange: (v: string) => void
    onSubmit: () => void
}

export function ChatOfferModal({
    open,
    onOpenChange,
    budget,
    deadline,
    note,
    error,
    isLoading,
    onBudgetChange,
    onDeadlineChange,
    onNoteChange,
    onSubmit,
}: ChatOfferModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Custom Offer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="number"
                        value={budget}
                        onChange={(e) => onBudgetChange(e.target.value)}
                        placeholder="Budget"
                    />
                    <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => onDeadlineChange(e.target.value)}
                    />
                    <Textarea
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder="Optional note"
                        rows={3}
                    />
                    {error && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={onSubmit} disabled={isLoading}>
                            Send Offer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Delete message confirm dialog ────────────────────────────────────────────
interface DeleteMessageDialogProps {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function DeleteMessageDialog({ open, onCancel, onConfirm }: DeleteMessageDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete message?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove the message for both participants.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-rose-600 text-white hover:bg-rose-700">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ── Delete chat confirm dialog ───────────────────────────────────────────────
interface DeleteChatDialogProps {
    open: boolean
    isLoading: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function DeleteChatDialog({ open, isLoading, onOpenChange, onConfirm }: DeleteChatDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove the conversation from your inbox.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isLoading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                        {isLoading ? "Deleting..." : "Delete chat"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
