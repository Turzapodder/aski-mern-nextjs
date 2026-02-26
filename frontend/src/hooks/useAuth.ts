"use client";

import { useGetUserQuery } from "@/lib/services/auth";
import type { UserRole } from "@/types";

/**
 * useAuth — Centralized auth state hook.
 * Wraps RTK Query's useGetUserQuery and exposes typed, convenient fields.
 *
 * Usage:
 *   const { user, isAdmin, isTutor, isStudent, isLoading } = useAuth()
 */
export const useAuth = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetUserQuery();
  const user = data?.user ?? null;

  const roles: UserRole[] = Array.isArray(user?.roles) ? user.roles : [];

  const isAdmin = roles.includes("admin");
  const isTutor = roles.includes("tutor");
  const isStudent = roles.includes("user") || roles.includes("student");
  const isAuthenticated = Boolean(user);
  const isChecking = isLoading || isFetching;

  return {
    user,
    roles,
    isAdmin,
    isTutor,
    isStudent,
    isAuthenticated,
    isLoading: isChecking,
    isError,
    refetch,
  };
};

export default useAuth;
