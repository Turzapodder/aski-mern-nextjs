"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function AdminPagination({
    currentPage,
    totalPages,
    onPageChange,
}: AdminPaginationProps) {
    const getPageNumbers = () => {
        const pages = []
        const showMax = 5

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push("ellipsis")

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i)
            }

            if (currentPage < totalPages - 2) pages.push("ellipsis")
            if (!pages.includes(totalPages)) pages.push(totalPages)
        }
        return pages
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * 20, totalPages * 20)}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-md"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((page, idx) => (
                            page === "ellipsis" ? (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    className="rounded-none px-4 py-2"
                                    onClick={() => onPageChange(page as number)}
                                >
                                    {page}
                                </Button>
                            )
                        ))}

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-r-md"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
