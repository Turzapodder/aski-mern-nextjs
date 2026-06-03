'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import SendProposalModal from './SendProposalModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssignmentsLogic } from '@/lib/hooks/useAssignmentsLogic';
import AssignmentCard from './AssignmentCard';
import { AdvancedFilter, FilterField } from '@/components/common/AdvancedFilter';

export const AssignmentsClient = () => {
  const {
    searchTerm: actualSearchTerm,
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
    handleProposalModalClose,
  } = useAssignmentsLogic();

  const [searchInput, setSearchInput] = useState(actualSearchTerm);
  const [sortOrder, setSortOrder] = useState('newest');

  const filterFields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'created', label: 'Created' },
        { value: 'proposal_received', label: 'Proposal Received' },
        { value: 'proposal_accepted', label: 'Proposal Accepted' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'submission_pending', label: 'Submission Pending' },
        { value: 'revision_requested', label: 'Revision Requested' },
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'disputed', label: 'Disputed' },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ];

  const sortedAssignments = useMemo(() => {
    const sorted = [...assignments];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === 'deadline_soon') {
      sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    return sorted;
  }, [assignments, sortOrder]);


  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-medium mb-6 text-lg">
            {error && 'data' in error
              ? (error.data as any)?.message || 'Failed to load assignments'
              : 'Failed to load assignments'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-0 md:p-4 md:p-8">
      <div className="max-w-400 mx-auto p-2 md:p-8  pt-2 md:pt-2">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Assignment Board</h1>
          <p className="text-gray-500 text-lg">Discover and manage assignment opportunities.</p>
        </div>

        <div className="mb-6">
          <AdvancedFilter
            searchPlaceholder="Search assignments by title or topics..."
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => setSearchTerm(searchInput)}
            fields={filterFields}
            filterValues={{
              status: statusFilter,
              priority: priorityFilter,
            }}
            onFilterChange={(id, value) => {
              if (id === 'status') setStatusFilter(value);
              if (id === 'priority') setPriorityFilter(value);
            }}
            onReset={() => {
              setSearchInput('');
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            onApply={() => setSearchTerm(searchInput)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-1">
          <div className="text-sm font-medium text-gray-500 bg-white/60 px-3 py-1.5 rounded-lg inline-block border border-gray-200/50">
            Showing <span className="text-gray-900 font-bold">{assignments.length}</span> assignments
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm text-gray-700 font-medium appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline_soon">Deadline: Ending Soon</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {actualSearchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'We couldn\'t find any assignments matching your current filters. Try adjusting them for better results.'
                  : 'There are no assignments available right now. Check back later!'}
              </p>
              {(actualSearchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSearchInput('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="mt-6 text-primary-600 font-medium hover:text-primary-700 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            sortedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                latestStatus={latestStatuses[assignment._id]}
                isTutor={isTutor}
                currentUser={currentUser}
                formatAmount={formatAmount}
                handleViewDetails={handleViewDetails}
                handleSendProposal={handleSendProposal}
              />
            ))
          )}
        </div>
      </div>

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

export default AssignmentsClient;
