"use client"
// Error boundary for user routes — shown when a page throws an unexpected error.
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function UserError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("User route error:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="text-gray-500 max-w-sm">
                An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            <Button onClick={reset} variant="outline">
                Try again
            </Button>
        </div>
    )
}
