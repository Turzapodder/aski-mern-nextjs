"use client"

import { useRouter } from "next/navigation"
import { ArrowRightCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AdminPagination from "@/components/admin/AdminPagination"
import { DisputeRow, useAdminDisputesLogic } from "./useAdminDisputesLogic"

export const AdminDisputesClient = () => {
  const router = useRouter()
  const {
    page,
    setPage,
    paginatedDisputes,
    disputes,
    totalPages,
    isLoading,
    error
  } = useAdminDisputesLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Disputes</h1>
        <p className="text-sm text-gray-500">Investigate and resolve disputed assignments.</p>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active disputes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load disputes.
            </div>
          )}

          {!isLoading && !error && disputes.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No active disputes right now.
            </div>
          )}

          {!isLoading && !error && disputes.length > 0 && (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-3 pr-4">Assignment</th>
                      <th className="py-3 pr-4">Student</th>
                      <th className="py-3 pr-4">Tutor</th>
                      <th className="py-3 pr-4">Escrow</th>
                      <th className="py-3 pr-4">Updated</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDisputes.map((dispute: DisputeRow) => (
                      <tr key={dispute._id} className="hover:bg-gray-50/60">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          <button
                            onClick={() => router.push(`/admin/reports/${dispute._id}`)}
                            className="hover:text-primary-600 hover:underline text-left transition-colors cursor-pointer"
                          >
                            {dispute.title}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{dispute.student?.name || "N/A"}</td>
                        <td className="py-3 pr-4 text-gray-600">{dispute.assignedTutor?.name || "N/A"}</td>
                        <td className="py-3 pr-4 text-gray-700">
                          {dispute.paymentAmount || dispute.estimatedCost || 0}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(dispute.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => router.push(`/admin/reports/${dispute._id}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Review
                            <ArrowRightCircle className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedDisputes.map((dispute: DisputeRow) => (
                  <div key={dispute._id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm transition-all hover:border-rose-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <button
                          onClick={() => router.push(`/admin/reports/${dispute._id}`)}
                          className="font-bold text-gray-900 hover:text-primary-600 hover:underline transition-colors text-left text-sm truncate block w-full"
                        >
                          {dispute.title}
                        </button>
                        <p className="text-xs text-gray-500">
                          ID: {dispute._id.substring(0, 8)}...
                        </p>
                      </div>
                      <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-[10px] font-bold uppercase tracking-wider">
                        Disputed
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Student</p>
                        <p className="text-xs font-medium text-gray-700 truncate">{dispute.student?.name || "N/A"}</p>
                      </div>
                      <div className="space-y-1 text-right min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Tutor</p>
                        <p className="text-xs font-medium text-gray-700 truncate">{dispute.assignedTutor?.name || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Escrow Value</p>
                        <p className="text-xs font-bold text-rose-600">৳{dispute.paymentAmount || dispute.estimatedCost || 0}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Last Update</p>
                        <p className="text-[11px] text-gray-600 font-medium">{new Date(dispute.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/admin/reports/${dispute._id}`)}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                    >
                      Review Dispute
                      <ArrowRightCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <AdminPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
