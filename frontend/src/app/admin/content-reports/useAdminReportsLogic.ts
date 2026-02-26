import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi, ReportRecord } from "@/lib/adminApi"

export const getEntityLabel = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback

export const getReportedLabel = (report: ReportRecord) => {
  const entity = report.reportedEntity as { title?: unknown; name?: unknown } | null | undefined
  if (report.reportedType === "assignment") {
    return getEntityLabel(entity?.title, "Assignment")
  }
  return getEntityLabel(entity?.name, "Profile")
}

export const useAdminReportsLogic = () => {
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

  return {
    status, setStatus,
    type, setType,
    reporterType, setReporterType,
    startDate, setStartDate,
    endDate, setEndDate,
    page, setPage,
    reports,
    pagination,
    handleAction,
    isLoading,
    error
  }
}
