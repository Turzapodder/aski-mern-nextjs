"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowRightCircle } from "lucide-react"

import { adminApi } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type DisputeRow = Record<string, any>

export default function AdminDisputesPage() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR("admin-disputes", () => adminApi.disputes.getAll())

  const disputes = useMemo(() => data?.data ?? [], [data])

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
            <div className="overflow-x-auto">
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
                  {disputes.map((dispute: DisputeRow) => (
                    <tr key={dispute._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 font-medium text-gray-900">{dispute.title}</td>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
