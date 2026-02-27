"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGetUserQuery } from "@/lib/services/auth"
import { useAppDispatch } from "@/lib/hooks"
import { setUserProfile } from "@/lib/features/auth/authSlice"

const useAdminAuth = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data, isLoading, isFetching, isError } = useGetUserQuery()
  const user = data?.user
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("admin")
  const isChecking = isLoading || isFetching

  useEffect(() => {
    if (user) {
      dispatch(setUserProfile(user))
    }
  }, [user, dispatch])

  useEffect(() => {
    if (isChecking) return
    if (!user || !isAdmin || isError) {
      router.replace("/account/login?role=admin")
    }
  }, [isChecking, isAdmin, isError, router, user])

  return {
    user,
    isAdmin,
    isLoading: isChecking,
  }
}

export default useAdminAuth
