'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  BookOpen,
  Search,
  Flag,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import SendProposalModal from '@/components/SendProposalModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssignmentsLogic } from '@/lib/hooks/useAssignmentsLogic';
import AssignmentCard from './AssignmentCard';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

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
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-400 mx-auto p-6 md:p-8  pt-2 md:pt-2">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Assignment Board</h1>
          <p className="text-gray-500 text-lg">Discover and manage assignment opportunities.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60 mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search assignments by title or topics..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-l-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none text-gray-700 font-medium"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-r-xl transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            <div className="w-px bg-gray-100 hidden lg:block mx-1"></div>

            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              <div className="relative group shrink-0 min-w-40">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none text-gray-700 font-medium appearance-none cursor-pointer relative"
                >
                  <option value="all">All Statuses</option>
                  <option value="created">Created</option>
                  <option value="proposal_received">Proposal received</option>
                  <option value="proposal_accepted">Proposal accepted</option>
                  <option value="in_progress">In progress</option>
                  <option value="submission_pending">Submission pending</option>
                  <option value="revision_requested">Revision requested</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="overdue">Overdue</option>
                  <option value="disputed">Disputed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="relative group shrink-0 min-w-37.5">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none text-gray-700 font-medium appearance-none cursor-pointer relative"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
          </div>
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
