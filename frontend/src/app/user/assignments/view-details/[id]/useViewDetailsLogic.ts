import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import { Assignment, useGetAssignmentByIdQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { useGetSubmissionsQuery } from "@/lib/services/submissions";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

export const getWorkflowStep = (assignment?: Assignment) => {
  if (!assignment) return "details";
  const status = assignment.status;
  const paymentStatus = assignment.paymentStatus;

  if (["draft", "created", "pending"].includes(status)) return "details";
  if (status === "proposal_received") return "proposals";
  if (
    ["in_progress", "submission_pending", "revision_requested", "assigned"].includes(status) ||
    (paymentStatus === "paid" && status === "proposal_accepted")
  ) {
    return "submission";
  }
  if (status === "proposal_accepted" || (paymentStatus === "pending" && assignment.assignedTutor)) {
    return "payment";
  }
  if (status === "overdue") {
    if (paymentStatus === "paid" || assignment.assignedTutor) {
      return "submission";
    }
    return "details";
  }
  if (["submitted", "completed", "disputed", "resolved"].includes(status)) {
    return "review";
  }
  return "details";
};

export const useViewDetailsLogic = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStateFromUrl = searchParams.get("payment");
  const id = params.id as string;
  const [showProposal, setShowProposal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStudentOpen, setReportStudentOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const {
    data: assignmentData,
    isLoading,
    error,
    refetch,
  } = useGetAssignmentByIdQuery(id || "", {
    skip: !id,
  });
  const { data: submissionsData } = useGetSubmissionsQuery(
    id ? { assignmentId: id, limit: 1 } : skipToken
  );

  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutorRole = currentUser?.roles?.includes("tutor");
  const currency = currentUser?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);
  
  const handleSendProposal = () => {
    setShowProposal(true);
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!paymentStateFromUrl) return;

    if (paymentStateFromUrl === "completed" || paymentStateFromUrl === "success") {
      toast.success("Payment confirmed");
      refetch();
      return;
    }

    if (paymentStateFromUrl === "pending") {
      toast.info("Payment is pending confirmation");
      refetch();
      return;
    }

    if (paymentStateFromUrl === "cancelled") {
      toast.warning("Payment was cancelled");
      return;
    }

    if (paymentStateFromUrl === "failed") {
      toast.error("Payment verification failed");
    }
  }, [paymentStateFromUrl, refetch]);

  const handleRequestedTutorProfile = (assignment: Assignment) => {
    if (!assignment?.requestedTutor?._id) return;
    router.push(`/user/tutors/tutor-profile/${assignment.requestedTutor._id}`);
  };

  return {
    router,
    showProposal,
    setShowProposal,
    reportOpen,
    setReportOpen,
    reportStudentOpen,
    setReportStudentOpen,
    now,
    assignmentData,
    isLoading,
    error,
    refetch,
    submissionsData,
    currentUser,
    isTutorRole,
    currency,
    formatAmount,
    handleSendProposal,
    handleRequestedTutorProfile
  }
}
