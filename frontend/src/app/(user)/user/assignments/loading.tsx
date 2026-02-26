// Streaming skeleton for user assignments.
import { Skeleton } from "@/components/ui/skeleton"

export default function AssignmentsLoading() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64 opacity-60" />
            </div>
            {/* Filter bar */}
            <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="ml-auto h-10 w-40 rounded-lg" />
            </div>
            {/* Assignment cards */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        </div>
    )
}
