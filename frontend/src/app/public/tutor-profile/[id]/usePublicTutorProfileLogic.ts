import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { adminApi } from "@/lib/adminApi"

export const usePublicTutorProfileLogic = () => {
    // Put any tutor logic here
    const params = useParams<{ id: string }>()
    const tutorId = params?.id
    
    return {
        tutorId
    }
}
