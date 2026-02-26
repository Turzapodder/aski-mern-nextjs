import { useMemo, useState } from "react"
import useSWR from "swr"
import { adminApi } from "@/lib/adminApi"

export type DisputeRow = Record<string, any>

export const useAdminDisputesLogic = () => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const { data, error, isLoading } = useSWR("admin-disputes", () => adminApi.disputes.getAll())

  const disputes = useMemo(() => data?.data ?? [], [data])

  const paginatedDisputes = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return disputes.slice(start, start + itemsPerPage)
  }, [disputes, page])

  const totalPages = Math.ceil(disputes.length / itemsPerPage)

  return {
    page,
    setPage,
    paginatedDisputes,
    disputes,
    totalPages,
    isLoading,
    error
  }
}
