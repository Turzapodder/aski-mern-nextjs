"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  BookOpen,
  Eye,
  Search,
  Send
} from "lucide-react";
import { useGetAssignmentsQuery, Assignment } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLatestSubmissionStatusByAssignmentsQuery } from "@/lib/services/submissions";
import SendProposalModal from "@/components/SendProposalModal";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const AllAssignmentsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Get current user data
  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutor = currentUser?.roles?.includes('tutor');
  const currency = currentUser?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);

  // Use RTK Query to fetch assignments
  const {
    data: assignmentsData,
    isLoading: loading,
    error,
    refetch
  } = useGetAssignmentsQuery({
    page: 1,
    limit: 50,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    search: searchTerm || undefined
  });

  const assignments = useMemo(() => assignmentsData?.data || [], [assignmentsData?.data]);
  const assignmentIds = useMemo(() => assignments.map((assignment) => assignment._id), [assignments]);
  const { data: latestStatusesData } = useGetLatestSubmissionStatusByAssignmentsQuery(
    assignmentIds.length > 0 ? { assignmentIds } : skipToken
  );
  const latestStatuses = latestStatusesData?.data || {};

  // Use assignments directly since API already handles filtering
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
      case 'pending':
      case 'proposal_received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'proposal_accepted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_progress':
      case 'submission_pending':
      case 'assigned':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'submitted':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue':
      case 'disputed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/user/assignments/view-details/${assignmentId}`);
  };

  const handleSendProposal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsProposalModalOpen(true);
  };

  const handleProposalModalClose = () => {
    setIsProposalModalOpen(false);
    setSelectedAssignment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {error && 'data' in error ?
              (error.data as any)?.message || 'Failed to load assignments' :
              'Failed to load assignments'
            }
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Assignments</h1>
          <p className="text-gray-600">Manage and view all assignment requests</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="created">Created</option>
                <option value="proposal_received">Proposal received</option>
                <option value="proposal_accepted">Proposal accepted</option>
                <option value="in_progress">In progress</option>
                <option value="submission_pending">Submission pending</option>
                <option value="revision_requested">Revision requested</option>
                <option value="pending">Pending (legacy)</option>
                <option value="assigned">Assigned (legacy)</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="overdue">Overdue</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-start md:justify-end">
              <span className="text-sm text-gray-600">
                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "There are no assignments available at the moment."
                }
              </p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    {/* Title and Subject */}
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.subject}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                        {latestStatuses[assignment._id]?.status === "under_review" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700">
                            Under review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Topics */}
                    {assignment.topics && assignment.topics.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {assignment.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {topic}
                            </span>
                          ))}
                          {assignment.topics.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              +{assignment.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assignment Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted: {formatDate(assignment.createdAt)}</span>
                      </div>
                      {(assignment.budget ?? assignment.estimatedCost) > 0 && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Student:</span> {assignment.student.name} ({assignment.student.email})
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch lg:ml-6">
                    <button
                      onClick={() => handleViewDetails(assignment._id)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors space-x-2 sm:w-auto lg:w-full"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>

                    {/* Show Send Proposal button only for tutors */}
                    {isTutor &&
                      ['pending', 'created', 'proposal_received'].includes(assignment.status) &&
                      !assignment.assignedTutor &&
                      (!assignment.requestedTutor || assignment.requestedTutor?._id === currentUser?._id) && (
                        <button
                          onClick={() => handleSendProposal(assignment)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2 sm:w-auto lg:w-full"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send Proposal</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Proposal Modal */}
      {selectedAssignment && (
        <SendProposalModal
          isOpen={isProposalModalOpen}
          onClose={handleProposalModalClose}
          assignment={selectedAssignment}
          currency={currency}
        />
      )}
    </div>
  );
};

export default AllAssignmentsPage;
