import { useMemo } from 'react';
import { useGetAssignmentsQuery } from '@/lib/services/assignments';
import { useGetLatestSubmissionStatusByAssignmentsQuery } from '@/lib/services/submissions';
import { skipToken } from '@reduxjs/toolkit/query';

export function useDashboard() {
  const { data: assignmentsData, isLoading } = useGetAssignmentsQuery({});

  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);

  const assignmentIds = useMemo(() => assignments.map((a) => a._id), [assignments]);

  const { data: latestStatusesData } = useGetLatestSubmissionStatusByAssignmentsQuery(
    assignmentIds.length ? { assignmentIds } : skipToken
  );

  const latestStatuses = latestStatusesData?.data || {};

  const ongoingAssignments = assignments.filter((a) =>
    ['assigned', 'submitted', 'in_progress', 'submission_pending', 'revision_requested'].includes(
      a.status
    )
  );

  const completedAssignments = assignments.filter((a) => a.status === 'completed');

  const pendingAssignments = assignments.filter((a) =>
    ['pending', 'draft', 'created', 'proposal_received', 'proposal_accepted'].includes(a.status)
  );

  return {
    assignments,
    ongoingAssignments,
    completedAssignments,
    pendingAssignments,
    latestStatuses,
    isLoading,
  };
}
