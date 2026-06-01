import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAssignmentsQuery } from '@/lib/services/assignments';
import { useGetProposalsByTutorQuery } from '@/lib/services/proposals';
import { useGetUserQuery } from '@/lib/services/auth';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetLatestSubmissionStatusByAssignmentsQuery } from '@/lib/services/submissions';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency';

export type TabValue = 'active' | 'awaiting_payment' | 'proposals' | 'under_review';

export const useProjectsLogic = () => {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useGetUserQuery();
  const user = userData?.user;
  const isTutor = user?.roles?.includes('tutor');
  const currency = user?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);

  const [activeTab, setActiveTab] = useState<TabValue>('active');

  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
  } = useGetAssignmentsQuery(
    isTutor
      ? {
          status: 'proposal_accepted,in_progress,submission_pending,revision_requested,assigned,submitted,overdue',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 100,
        }
      : skipToken
  );

  const {
    data: proposalsData,
    isLoading: isProposalsLoading,
    error: proposalsError,
  } = useGetProposalsByTutorQuery(isTutor ? {} : skipToken);

  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);
  const proposals = useMemo(() => proposalsData?.data?.proposals || [], [proposalsData?.data?.proposals]);

  const assignedToMe = useMemo(() => {
    return assignments.filter((assignment) => assignment.assignedTutor?._id === user?._id);
  }, [assignments, user?._id]);

  const categorizedProjects = useMemo(() => {
    const active: any[] = [];
    const awaiting: any[] = [];
    const review: any[] = [];

    assignedToMe.forEach((assignment) => {
      if (assignment.paymentStatus !== 'paid') {
        awaiting.push(assignment);
      } else if (
        ['submitted', 'submission_pending', 'revision_requested'].includes(assignment.status)
      ) {
        review.push(assignment);
      } else {
        active.push(assignment);
      }
    });

    return { active, awaiting, review };
  }, [assignedToMe]);

  const assignmentIds = useMemo(() => assignedToMe.map((a) => a._id), [assignedToMe]);

  const { data: latestStatusesData } = useGetLatestSubmissionStatusByAssignmentsQuery(
    assignmentIds.length > 0 ? { assignmentIds } : skipToken
  );
  const latestStatuses = latestStatusesData?.data || {};

  const isLoading = isAssignmentsLoading || isProposalsLoading;
  const error = assignmentsError || proposalsError;

  return {
    router,
    userLoading,
    isTutor,
    formatAmount,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    categorizedProjects,
    proposals,
    latestStatuses,
  };
};
