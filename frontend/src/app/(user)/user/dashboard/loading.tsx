// Streaming skeleton for the user dashboard area.
// Next.js displays this instantly while the page component fetches data.
import { Skeleton } from "@/components/ui/skeleton"

export default function UserDashboardLoading() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Page title area */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72 opacity-60" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>

            {/* Content rows */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    )
}
