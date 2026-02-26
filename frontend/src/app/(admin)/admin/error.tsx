"use client"
// Error boundary for admin routes.
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Admin route error:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Panel Error</h2>
            <p className="text-gray-500 max-w-sm">
                Something went wrong in the admin panel. Please try again or refresh the page.
            </p>
            <Button onClick={reset} variant="outline">
                Try again
            </Button>
        </div>
    )
}
