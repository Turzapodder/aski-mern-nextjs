'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  BookOpen,
  ArrowUpDown,
  Grid,
  List
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
    statusCounts,
    handleViewDetails,
    handleSendProposal,
    handleProposalModalClose,
    page,
    setPage,
    totalPages,
  } = useAssignmentsLogic();

  const [searchInput, setSearchInput] = useState(actualSearchTerm);
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filterFields: FilterField[] = [
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

  const tabs = [
    { id: 'all', label: 'All', value: 'all', count: statusCounts?.all || 0 },
    { id: 'pending', label: 'Pending', value: 'created,proposal_received,pending,draft', count: statusCounts?.pending || 0 },
    { id: 'approved', label: 'Approved', value: 'proposal_accepted,in_progress,assigned,submission_pending,revision_requested,submitted,overdue', count: statusCounts?.approved || 0 },
    { id: 'rejected', label: 'Rejected', value: 'cancelled,disputed,resolved', count: statusCounts?.rejected || 0 },
    { id: 'paid', label: 'Paid', value: 'completed', count: statusCounts?.paid || 0 },
  ];

  const activeTabId = useMemo(() => {
    if (statusFilter === 'all') return 'all';
    if (statusFilter.includes('created')) return 'pending';
    if (statusFilter.includes('proposal_accepted')) return 'approved';
    if (statusFilter.includes('cancelled')) return 'rejected';
    if (statusFilter === 'completed') return 'paid';
    return 'all';
  }, [statusFilter]);

  const handleTabClick = (value: string) => {
    setStatusFilter(value);
  };

  // Helper to get active page range around current page
  const getPageNumbers = (current: number, total: number) => {
    const range = 2; // Number of pages to show before and after current
    const pages = [];
    for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
      pages.push(i);
    }
    return pages;
  };
  const pageNumbers = getPageNumbers(page, totalPages);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50/50">
        <div className=" mx-auto space-y-6">
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

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all duration-200 outline-none
                  ${
                    isActive
                      ? 'bg-black border-black text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200
                    ${isActive ? 'bg-white text-black' : 'bg-gray-100 text-gray-500'}
                  `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <AdvancedFilter
            searchPlaceholder="Search assignments by title or topics..."
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => setSearchTerm(searchInput)}
            fields={filterFields}
            filterValues={{
              priority: priorityFilter,
            }}
            onFilterChange={(id, value) => {
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
          
          <div className="flex items-center gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black transition-all outline-none text-sm text-gray-700 font-medium appearance-none cursor-pointer"
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
        </div>

        {/* Layout list or grid */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {sortedAssignments.length === 0 ? (
            <div className={`bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center ${viewMode === 'grid' ? 'col-span-full' : ''}`}>
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
                  className="mt-6 text-black font-medium hover:underline"
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
                viewMode={viewMode}
              />
            ))
          )}
        </div>

        {/* Pagination buttons */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="First Page"
            >
              &laquo;
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>

            {pageNumbers.map((pageNum) => {
              const isCurrent = pageNum === page;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                    isCurrent
                      ? 'bg-black text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Last Page"
            >
              &raquo;
            </button>
          </div>
        )}
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
