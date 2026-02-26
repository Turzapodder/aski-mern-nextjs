import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAssignmentsQuery, Assignment } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLatestSubmissionStatusByAssignmentsQuery } from "@/lib/services/submissions";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getStatusColor = (status: string) => {
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

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const useAssignmentsLogic = () => {
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

    return {
        router,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        selectedAssignment,
        isProposalModalOpen,
        currentUser,
        isTutor,
        currency,
        formatAmount,
        loading,
        error,
        refetch,
        assignments,
        latestStatuses,
        handleViewDetails,
        handleSendProposal,
        handleProposalModalClose
    }
}
