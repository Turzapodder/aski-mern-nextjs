"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowUpRight, AlertCircle, Clock } from "lucide-react";
import { useGetAssignmentsQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { Skeleton } from "@/components/ui/skeleton";

const statusStyles: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-800",
  submitted: "bg-amber-100 text-amber-800",
  overdue: "bg-rose-100 text-rose-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useGetUserQuery();
  const user = userData?.user;
  const isTutor = user?.roles?.includes("tutor");

  const { data: assignmentsData, isLoading, error } = useGetAssignmentsQuery({
    status: "assigned,submitted,overdue",
    sortBy: "updatedAt",
    sortOrder: "desc",
    limit: 50,
  });

  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);

  const activeAssignments = useMemo(() => {
    if (!isTutor) return [];
    return assignments.filter((assignment) => assignment.assignedTutor?._id === user?._id);
  }, [assignments, isTutor, user?._id]);

  if (userLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Ongoing projects are available for tutors only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ongoing Projects</h1>
          <p className="text-sm text-gray-500">Assignments you are currently working on.</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Unable to load projects right now.
        </div>
      )}

      {!isLoading && !error && activeAssignments.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No ongoing projects</h2>
          <p className="text-sm text-gray-500">
            Accept a proposal to start your first project.
          </p>
        </div>
      )}

      {!isLoading && !error && activeAssignments.length > 0 && (
        <div className="grid gap-4">
          {activeAssignments.map((assignment) => {
            const statusLabel = assignment.status || "assigned";
            const statusClass = statusStyles[statusLabel] || "bg-gray-100 text-gray-700";

            return (
              <div
                key={assignment._id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{assignment.subject}</div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {new Date(assignment.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      Budget ${assignment.budget ?? assignment.estimatedCost ?? 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/user/assignments/view-details/${assignment._id}`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  View details
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
