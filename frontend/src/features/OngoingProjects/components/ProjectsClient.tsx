'use client';

import { Calendar, ArrowUpRight, AlertCircle, Clock, CheckCircle2, FileText, Send, Hourglass } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useWithdrawProposalMutation } from '@/lib/services/proposals';
import { useProjectsLogic } from '../hooks/useProjectsLogic';
import { TabValue } from '../types';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
  proposal_accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  submission_pending: 'bg-amber-100 text-amber-800 border-amber-200',
  revision_requested: 'bg-orange-100 text-orange-800 border-orange-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  submitted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overdue: 'bg-rose-100 text-rose-800 border-rose-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const ProjectsClient = () => {
  const {
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
  } = useProjectsLogic();

  const [withdrawProposal, { isLoading: withdrawing }] = useWithdrawProposalMutation();

  const handleWithdrawProposal = async (proposalId: string) => {
    try {
      await withdrawProposal({ id: proposalId }).unwrap();
      toast.success('Proposal withdrawn.');
    } catch {
      toast.error('Unable to withdraw proposal. Please try again.');
    }
  };

  if (userLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
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

  const tabs: { value: TabValue; label: string; count: number; icon: React.ReactNode }[] = [
    { value: 'active', label: 'Active Projects', count: categorizedProjects.active.length, icon: <Clock className="w-4 h-4" /> },
    { value: 'awaiting_payment', label: 'Awaiting Payment', count: categorizedProjects.awaiting.length, icon: <Hourglass className="w-4 h-4" /> },
    { value: 'proposals', label: 'Sent Proposals', count: proposals.length, icon: <Send className="w-4 h-4" /> },
    { value: 'under_review', label: 'In Review', count: categorizedProjects.review.length, icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  let displayItems: any[] = [];
  if (activeTab === 'active') displayItems = categorizedProjects.active;
  if (activeTab === 'awaiting_payment') displayItems = categorizedProjects.awaiting;
  if (activeTab === 'under_review') displayItems = categorizedProjects.review;

  const renderEmptyState = () => {
    return (
      <div className="col-span-1 md:col-span-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">No items found</h2>
        <p className="text-sm text-gray-500 mt-1">There are no projects in this category right now.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active projects, proposals, and submissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
        <div className="flex space-x-6 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === tab.value
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold ${
                activeTab === tab.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Unable to load data right now.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Display Proposals Tab */}
          {activeTab === 'proposals' && proposals.length === 0 && renderEmptyState()}
          {activeTab === 'proposals' && proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{proposal.title || 'Proposal'}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    proposal.status === 'accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    proposal.status === 'rejected' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                {proposal.assignment && (
                  <div className="text-sm text-gray-500 font-medium">For: {(proposal.assignment as any).title || 'Assignment'}</div>
                )}
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{proposal.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Sent {format(new Date(proposal.createdAt), 'MMM dd')}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-gray-700">
                    {formatAmount(proposal.proposedPrice)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {!['accepted', 'rejected', 'withdrawn'].includes(proposal.status) && (
                  <button
                    onClick={() => handleWithdrawProposal(proposal._id)}
                    disabled={withdrawing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    Withdraw
                  </button>
                )}
                <button
                  onClick={() => router.push(`/user/assignments/view-details/${(proposal.assignment as any)._id || proposal.assignment}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Assignment
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Display Assignments Tabs */}
          {activeTab !== 'proposals' && displayItems.length === 0 && renderEmptyState()}
          {activeTab !== 'proposals' && displayItems.map((assignment) => {
            const statusLabel = assignment.status || 'assigned';
            const statusClass = statusStyles[statusLabel] || 'bg-gray-50 text-gray-700 border-gray-200';
            const isUnderReview = latestStatuses[assignment._id]?.status === 'under_review';

            return (
              <div
                key={assignment._id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-2" title={assignment.title}>{assignment.title}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}
                    >
                      {statusLabel.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500">{assignment.subject}</div>
                  
                  {isUnderReview && (
                    <div className="inline-flex mt-1">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Under Review
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      Due {format(new Date(assignment.deadline), 'MMM dd')}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                      {formatAmount(assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/user/assignments/view-details/${assignment._id}`)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  View Workspace
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
