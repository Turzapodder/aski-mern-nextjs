// Streaming skeleton for the admin dashboard.
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Page title */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64 opacity-60" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>

            {/* Charts / tables */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton className="h-72 w-full rounded-2xl lg:col-span-2" />
                <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
        </div>
    )
}
