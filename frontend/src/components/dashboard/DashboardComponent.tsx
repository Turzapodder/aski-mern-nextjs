'use client';

import TopStats from './components/TopStats';
import ProjectSection from './components/ProjectSection';
import { StudentDashboardContentSkeleton } from '@/components/dashboard/DashboardSkeletons';
import UploadProjectForm from '../uploadForm';
import { useDashboard } from './hooks/useDashboard';
import { useGetAssignmentsQuery } from '@/lib/services/assignments';

export default function DashboardComponent() {
  const { data: assignmentsData, isLoading } = useGetAssignmentsQuery({});

  const {
    assignments,
    ongoingAssignments,
    completedAssignments,
    pendingAssignments,
    latestStatuses,
  } = useDashboard();

  return (
    <div className="bg-[#f6f6f6]">
      <TopStats assignments={assignments} />

      <div className="mb-12">
        <UploadProjectForm />
      </div>

      <ProjectSection
        title="Ongoing Projects"
        assignments={ongoingAssignments}
        latestStatuses={latestStatuses}
      />

      <ProjectSection
        title="Pending Projects"
        assignments={pendingAssignments}
        latestStatuses={latestStatuses}
      />

      <ProjectSection
        title="Completed Projects"
        assignments={completedAssignments}
        latestStatuses={latestStatuses}
      />
    </div>
  );
}
