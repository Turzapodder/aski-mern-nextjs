import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetAssignmentsQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLatestSubmissionStatusByAssignmentsQuery } from "@/lib/services/submissions";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

export const useProjectsLogic = () => {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useGetUserQuery();
  const user = userData?.user;
  const isTutor = user?.roles?.includes("tutor");
  const currency = user?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);

  const { data: assignmentsData, isLoading, error } = useGetAssignmentsQuery({
    status: "proposal_accepted,in_progress,submission_pending,revision_requested,assigned,submitted,overdue",
    sortBy: "updatedAt",
    sortOrder: "desc",
    limit: 50,
  });

  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);

  const activeAssignments = useMemo(() => {
    if (!isTutor) return [];
    return assignments.filter((assignment) => assignment.assignedTutor?._id === user?._id);
  }, [assignments, isTutor, user?._id]);

  const assignmentIds = useMemo(
    () => activeAssignments.map((assignment) => assignment._id),
    [activeAssignments]
  );
  
  const { data: latestStatusesData } = useGetLatestSubmissionStatusByAssignmentsQuery(
    assignmentIds.length > 0 ? { assignmentIds } : skipToken
  );
  
  const latestStatuses = latestStatusesData?.data || {};

  return {
    router,
    userLoading,
    isTutor,
    formatAmount,
    isLoading,
    error,
    activeAssignments,
    latestStatuses
  };
};
