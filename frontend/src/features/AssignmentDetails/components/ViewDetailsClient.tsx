'use client';

import React, { useState } from 'react';
import {
  Clock,
  Star,
  FileText,
  Send,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Award,
  AlertCircle,
  User as UserIcon,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import SendProposalModal from '@/components/common/SendProposalModal';
import ProposalsList from './ProposalsList';
import PaymentComponent from './PaymentComponent';
import TutorSubmissionPanel from '@/features/AssignmentDetails/components/TutorSubmissionPanel';
import SubmissionReviewSummary from '@/features/AssignmentDetails/components/SubmissionReviewSummary';
import ReportModal from '@/components/common/ReportModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useViewDetailsLogic, getWorkflowStep } from '../hooks/useViewDetailsLogic';
import CompletionFeedback from './completionFeedback/CompletionFeedback';
import { useDeleteAssignmentMutation } from '@/lib/services/assignments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';


export const ViewDetailsClient = () => {
  const {
    router,
    showProposal,
    setShowProposal,
    reportOpen,
    setReportOpen,
    reportStudentOpen,
    setReportStudentOpen,
    now,
    assignmentData,
    isLoading,
    error,
    refetch,
    submissionsData,
    currentUser,
    isTutorRole,
    currency,
    formatAmount,
    handleSendProposal,
    handleRequestedTutorProfile,
  } = useViewDetailsLogic();

  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!assignmentData?.data?._id) return;
    try {
      await deleteAssignment(assignmentData.data._id).unwrap();
      setIsDeleteDialogOpen(false);
      router.push('/user/assignments');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete assignment');
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
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
            {error && 'data' in error
              ? (error.data as any)?.message || 'Failed to load assignment details'
              : 'Failed to load assignment details'}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const assignment = assignmentData?.data;
  const latestSubmissionStatus = submissionsData?.data?.[0]?.status;

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Assignment not found</p>
          <button
            onClick={() => router.back()}
            className="bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAssignmentStudent = assignment.student?._id === currentUser?._id;
  const isAssignmentTutor = assignment.assignedTutor?._id === currentUser?._id;
  const reporterType = isTutorRole ? 'tutor' : 'user';

  const openStatuses = ['pending', 'created', 'proposal_received'];
  const canTutorSubmitProposal =
    Boolean(isTutorRole) &&
    openStatuses.includes(assignment.status) &&
    !assignment.assignedTutor &&
    (!assignment.requestedTutor || assignment.requestedTutor?._id === currentUser?._id);

  const canTutorSubmitWork =
    Boolean(isAssignmentTutor) &&
    assignment.paymentStatus === 'paid' &&
    [
      'in_progress',
      'submission_pending',
      'revision_requested',
      'assigned',
      'proposal_accepted',
      'overdue',
    ].includes(assignment.status);

  const showPaymentSection =
    Boolean(isAssignmentStudent) &&
    Boolean(assignment.assignedTutor) &&
    assignment.paymentStatus !== 'paid' &&
    !['cancelled', 'disputed', 'resolved', 'completed'].includes(assignment.status);

  const showPaymentComplete = Boolean(isAssignmentStudent) && assignment.paymentStatus === 'paid';

  const showCompletionFeedback =
    Boolean(isAssignmentStudent) && ['submitted', 'completed'].includes(assignment.status);

  const workflowSteps = [
    { id: 'details', label: 'Details', icon: CheckCircle },
    { id: 'proposals', label: 'Proposals', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'submission', label: 'Submission', icon: Send },
    { id: 'review', label: 'Review', icon: Award },
  ];

  const currentStep = getWorkflowStep(assignment);
  const isAssignmentCompleted = assignment.status === 'completed';
  const currentStepIndex = Math.max(
    0,
    workflowSteps.findIndex((step) => step.id === currentStep)
  );
  const progressWidth = `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%`;

  const formatDeadline = (deadline: string, showCountdown: boolean) => {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
      return 'Deadline unavailable';
    }
    if (!showCountdown) {
      return `Deadline scheduled: ${date.toLocaleDateString()}`;
    }
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const formatParts = (totalSeconds: number) => {
      const absSeconds = Math.max(0, totalSeconds);
      const days = Math.floor(absSeconds / 86400);
      const hours = Math.floor((absSeconds % 86400) / 3600);
      const minutes = Math.floor((absSeconds % 3600) / 60);
      const seconds = absSeconds % 60;
      const parts = [];
      if (days > 0) {
        parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        return parts.join(' ');
      }
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      return parts.join(' ');
    };

    if (diffSeconds > 0) {
      return `Time remaining: ${formatParts(diffSeconds)}`;
    }
    if (diffSeconds === 0) {
      return 'Due now';
    }
    return `Overdue by ${formatParts(Math.abs(diffSeconds))}`;
  };

  const timerActiveStatuses = [
    'proposal_accepted',
    'in_progress',
    'submission_pending',
    'revision_requested',
    'assigned',
    'submitted',
    'completed',
    'overdue',
    'disputed',
    'resolved',
  ];
  const showDeadlineCountdown = timerActiveStatuses.includes(assignment.status);

  return (
    <div className="w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Header - full width, outside grid */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 flex justify-between items-start gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Assignment Details</p>
            <h1 className="text-2xl sm:text-3xl font-bold  text-gray-900 mb-2">{assignment.title}</h1>
          </div>
          {isAssignmentStudent && (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer text-gray-700 font-medium">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm capitalize">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          Status: {assignment.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900">Milestones</h3>
              <span className="text-sm font-semibold text-gray-500">
                {Math.round((currentStepIndex / (workflowSteps.length - 1)) * 100)}% Complete
              </span>
            </div>
            <div className="relative overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 z-0 rounded-full">
                  <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: progressWidth }}></div>
                </div>
                <div className="relative z-10 flex justify-between">
                  {workflowSteps.map((step, index) => {
                    const isComplete = isAssignmentCompleted ? true : index < currentStepIndex;
                    const isCurrent = !isAssignmentCompleted && index === currentStepIndex;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center w-20">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all ${isComplete ? 'bg-primary-500 text-white shadow-md' : isCurrent ? 'bg-primary-500 text-white shadow-md ring-4 ring-primary-100' : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}>
                          {isComplete ? <CheckCircle size={18} /> : <StepIcon size={16} />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isComplete || isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Description + Budget/Priority side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description Card - takes 2 cols if budget exists, 3 if not */}
            <div className={`bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 ${(assignment.budget || assignment.estimatedCost) ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <h3 className="text-base font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{assignment.description}</p>
              {assignment.topics && assignment.topics.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {assignment.topics.map((topic: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-primary-100/50 text-primary-700 rounded-full text-xs font-medium">{topic}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget + Priority stacked - only shown when budget data exists */}
            {(assignment.budget || assignment.estimatedCost) && (
              <div className="md:col-span-1 flex flex-col gap-6">
                {/* Budget Card */}
                <div className="bg-primary-500 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between flex-1 min-h-[160px]">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div className="mt-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80 mb-1">Estimated Budget</p>
                    <p className="text-2xl font-bold">{formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}</p>
                  </div>
                </div>
                {/* Priority Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between flex-1 min-h-[130px]">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div className="mt-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Priority</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{assignment.priority || 'Medium'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Activity */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-5">Project Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Star size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{assignment.viewCount || 0}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Views</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{assignment.proposalCount || 0}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Proposals</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 capitalize">{assignment.discussionCount && assignment.discussionCount > 0 ? 'Active' : 'Pending'}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Discussion</p>
                </div>
              </div>
            </div>
          </div>

          {showPaymentSection && (
            <PaymentComponent
              assignment={assignment}
              onPaymentComplete={() => {
                refetch();
              }}
              currency={currency}
            />
          )}

          {showPaymentComplete && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment completed</h2>
              <p className="text-sm text-gray-600">
                Paid amount:{' '}
                {formatAmount(
                  assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0
                )}
              </p>
            </div>
          )}

          {isTutorRole && assignment.paymentStatus !== 'paid' && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Awaiting payment</h2>
              <p className="text-sm text-gray-600">
                The student must complete payment before you can submit work.
              </p>
            </div>
          )}

          {isAssignmentTutor && assignment.paymentStatus === 'paid' && canTutorSubmitWork && (
            <TutorSubmissionPanel assignment={assignment} onSubmitted={() => refetch()} />
          )}

          {isAssignmentTutor && assignment.status === 'submitted' && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Submission sent</h2>
              <p className="text-sm text-gray-600">
                Your submission is with the student for review. You will be notified if revisions
                are requested.
              </p>
            </div>
          )}

          {isAssignmentTutor &&
            ['submitted', 'completed', 'revision_requested'].includes(assignment.status) && (
              <SubmissionReviewSummary
                assignment={assignment}
                submissionStatus={latestSubmissionStatus}
              />
            )}

          {isAssignmentStudent &&
            assignment.assignedTutor &&
            assignment.paymentStatus === 'paid' &&
            [
              'in_progress',
              'submission_pending',
              'revision_requested',
              'assigned',
              'overdue',
            ].includes(assignment.status) && (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Work in progress</h2>
                <p className="text-sm text-gray-600">
                  Your tutor is working on the assignment. We will notify you when the submission is
                  ready.
                </p>
              </div>
            )}

          {showCompletionFeedback && (
            <CompletionFeedback assignment={assignment} submissionStatus={latestSubmissionStatus} />
          )}

          {showProposal && isTutorRole && assignment && (
            <SendProposalModal
              isOpen={showProposal}
              onClose={() => setShowProposal(false)}
              assignment={assignment}
              currency={currency}
            />
          )}

          {isAssignmentStudent && (
            <div className="mt-6">
              <ProposalsList assignmentId={assignment._id} isStudent={true} currency={currency} />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 relative">
              <UserIcon size={28} className="text-primary-500" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </span>
            </div>
            <h4 className="text-base font-bold text-gray-900">{assignment.student?.name || 'Student'}</h4>
            <p className="text-xs text-gray-400 mb-4 truncate">{assignment.student?.email || 'student@example.com'}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">View Profile</button>
              <button
                onClick={() => setReportOpen(true)}
                className="w-10 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <MessageSquare size={14} />
              </button>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} className="text-primary-500" />
              <h4 className="text-sm font-bold text-gray-900">Timeline</h4>
            </div>
            <div className="space-y-4">
              <div className="border-l-[3px] border-gray-200 pl-4 py-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Created</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(assignment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="border-l-[3px] border-red-400 pl-4 py-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-0.5">Deadline</p>
                <p className="text-sm font-bold text-red-500">
                  {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-red-400 mt-0.5">{formatDeadline(assignment.deadline, showDeadlineCountdown)}</p>
              </div>
            </div>
          </div>

          {/* Required Deliverables Card */}
          {(assignment.requestOneToOneSession || assignment.videoExplanation) && (
            <div className="bg-primary-50 rounded-2xl p-6 shadow-sm border border-primary-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={15} className="text-primary-600" />
                <h4 className="text-sm font-bold text-primary-900">Required Deliverables</h4>
              </div>
              <div className="space-y-3">
                {assignment.requestOneToOneSession && (
                  <div className="flex items-start gap-2 text-sm text-primary-800 font-medium">
                    <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-primary-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                    </div>
                    <span>1:1 Session with Student</span>
                  </div>
                )}
                {assignment.videoExplanation && (
                  <div className="flex items-start gap-2 text-sm text-primary-800 font-medium">
                    <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-primary-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                    </div>
                    <span>Video Explanation</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={15} className="text-primary-500" />
              <h4 className="text-sm font-bold text-gray-900">Resources</h4>
            </div>
            <div className="space-y-2.5">
              {assignment.attachments && assignment.attachments.length > 0 ? (
                assignment.attachments.map((attachment: any, index: number) => (
                  <a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 group">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-primary-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate group-hover:text-primary-600 transition-colors">{attachment.originalName}</span>
                  </a>
                ))
              ) : (
                <p className="text-xs text-gray-400">No attachments available.</p>
              )}
            </div>
            {/* Send Proposal / Requested Tutor */}
            {assignment.requestedTutor && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Requested Tutor</p>
                <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <UserIcon size={14} className="text-gray-400" />
                    <span className="text-xs font-medium">{assignment.requestedTutor.name}</span>
                  </div>
                  <button onClick={() => handleRequestedTutorProfile(assignment)} className="text-[10px] font-bold text-primary-500 hover:text-primary-600">View</button>
                </div>
              </div>
            )}
            {isTutorRole && canTutorSubmitProposal && (
              <button onClick={handleSendProposal} className="mt-4 w-full bg-secondary-300 hover:bg-secondary-200 text-gray-900 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                <Send size={14} />
                <span>Send Proposal</span>
              </button>
            )}
            {isTutorRole && !canTutorSubmitProposal && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 font-medium">
                This assignment is not accepting proposals right now.
              </div>
            )}
            {isTutorRole && assignment.student?._id && (
              <button onClick={() => setReportStudentOpen(true)} className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                Report student profile
              </button>
            )}
          </div>

          {/* Secure Best Pricing Card */}
          <div className="bg-primary-500 text-white rounded-2xl p-6 shadow-sm">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Award size={18} />
            </div>
            <h4 className="text-sm font-bold mb-2">Secure Best Pricing</h4>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Early assignment posting allows more tutors to bid, giving you a wider range of academic experts at competitive rates.
            </p>
          </div>
        </div>
      </div>

      {assignment && (
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          reporterType={reporterType}
          reportedType="assignment"
          reportedId={assignment._id}
        />
      )}
      {assignment?.student?._id && isTutorRole && (
        <ReportModal
          isOpen={reportStudentOpen}
          onClose={() => setReportStudentOpen(false)}
          reporterType="tutor"
          reportedType="userProfile"
          reportedId={assignment.student._id}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              assignment and withdraw any pending proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
