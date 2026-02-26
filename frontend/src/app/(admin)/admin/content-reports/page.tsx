"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { adminApi, ReportRecord } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import AdminPagination from "@/components/admin/AdminPagination"

export default function AdminReportsPage() {
  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")
  const [reporterType, setReporterType] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      status,
      type,
      reporterType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [page, status, type, reporterType, startDate, endDate]
  )

  const { data, error, isLoading, mutate } = useSWR(["admin-reports", params], () =>
    adminApi.reports.getAll(params)
  )

  const reports = data?.data ?? []
  const pagination = data?.pagination

  const handleAction = async (reportId: string, action: string) => {
    try {
      await adminApi.reports.takeAction(reportId, { action })
      toast.success("Report updated")
      mutate()
    } catch (err: any) {
      toast.error(err?.message || "Unable to update report")
    }
  }

  const getEntityLabel = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value : fallback

  const getReportedLabel = (report: ReportRecord) => {
    const entity = report.reportedEntity as { title?: unknown; name?: unknown } | null | undefined
    if (report.reportedType === "assignment") {
      return getEntityLabel(entity?.title, "Assignment")
    }
    return getEntityLabel(entity?.name, "Profile")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Review assignment and profile reports from users and tutors.</p>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-semibold">Report queue</CardTitle>
          <div className="grid gap-3 md:grid-cols-5">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="tutorProfile">Tutor profile</SelectItem>
                <SelectItem value="userProfile">User profile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reporterType} onValueChange={setReporterType}>
              <SelectTrigger>
                <SelectValue placeholder="Reporter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reporters</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
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
              Unable to load reports.
            </div>
          )}

          {!isLoading && !error && reports.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No reports match the current filters.
            </div>
          )}

          {!isLoading && !error && reports.length > 0 && (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-3 pr-4">Reported</th>
                      <th className="py-3 pr-4">Reason</th>
                      <th className="py-3 pr-4">Reporter</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report: ReportRecord) => (
                      <tr key={report._id} className="hover:bg-gray-50/60">
                        <td className="py-3 pr-4 font-medium text-gray-900">{getReportedLabel(report)}</td>
                        <td className="py-3 pr-4 text-gray-600">{report.reason}</td>
                        <td className="py-3 pr-4 text-gray-600">
                          {report.reporterId?.name || "Unknown"} ({report.reporterType})
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{report.status}</td>
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction(report._id, "mark_reviewed")}>
                                Mark reviewed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(report._id, "dismiss")}>
                                Dismiss
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(report._id, "delete_content")}>
                                Delete content
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(report._id, "block_user")}>
                                Block user
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {reports.map((report: ReportRecord) => (
                  <div key={report._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getReportedLabel(report)}</p>
                        <p className="text-xs text-gray-500">{report.reason}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500">{report.status}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Reporter: {report.reporterId?.name || "Unknown"} ({report.reporterType})
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(report._id, "mark_reviewed")}>
                        Mark reviewed
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(report._id, "dismiss")}>
                        Dismiss
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(report._id, "delete_content")}>
                        Delete content
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(report._id, "block_user")}>
                        Block user
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <AdminPagination
                  currentPage={page}
                  totalPages={pagination.pages}
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
