'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  MessageSquare,
  CreditCard,
  Send,
  Award
} from 'lucide-react';
import ReportModal from '@/components/common/ReportModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useViewDetailsLogic, getWorkflowStep } from '../hooks/useViewDetailsLogic';
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

// Import our phase-specific workspace views
import { BiddingPhaseView } from './phases/BiddingPhaseView';
import { EscrowPhaseView } from './phases/EscrowPhaseView';
import { ActiveWorkspaceView } from './phases/ActiveWorkspaceView';
import { ReviewCompletionView } from './phases/ReviewCompletionView';

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
  const defaultStep = getWorkflowStep(assignmentData?.data);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeStepId = selectedStep || defaultStep;
    const activeElement = stepRefs.current[activeStepId];
    const container = timelineRef.current;
    if (activeElement && container) {
      const containerWidth = container.clientWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.clientWidth;
      
      container.scrollTo({
        left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [selectedStep, defaultStep]);

  useEffect(() => {
    setSelectedStep(null);
  }, [defaultStep]);

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
      <div className="w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>

        {/* Milestones Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <div className="relative overflow-x-auto pb-4 pt-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="min-w-[768px] flex items-center justify-between overflow-visible px-2">
              {[1, 2, 3, 4, 5].map((idx) => (
                <React.Fragment key={idx}>
                  <Skeleton className="h-10 w-32 rounded-full shrink-0" />
                  {idx < 5 && (
                    <div className="flex-1 min-w-[20px] mx-1 h-[2px] bg-gray-100 rounded-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Columns Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <Skeleton className="h-6 w-40 rounded" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 text-center flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
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
  const reporterType = isTutorRole ? 'tutor' : 'user';

  const workflowSteps = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'proposals', label: 'Proposals', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'submission', label: 'Submission', icon: Send },
    { id: 'review', label: 'Review', icon: Award },
  ];

  const activeStep = selectedStep || defaultStep;
  const isAssignmentCompleted = assignment.status === 'completed';
  const currentStepIndex = Math.max(
    0,
    workflowSteps.findIndex((step) => step.id === defaultStep)
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

  // Render the appropriate body component based on the active lifecycle stage
  const renderPhaseView = () => {
    switch (activeStep) {
      case 'details':
        return (
          <BiddingPhaseView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            currency={currency}
            formatAmount={formatAmount}
            refetch={refetch}
            showProposal={showProposal}
            setShowProposal={setShowProposal}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
            handleSendProposal={handleSendProposal}
            handleRequestedTutorProfile={handleRequestedTutorProfile}
            mode="details"
          />
        );
      case 'proposals':
        return (
          <BiddingPhaseView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            currency={currency}
            formatAmount={formatAmount}
            refetch={refetch}
            showProposal={showProposal}
            setShowProposal={setShowProposal}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
            handleSendProposal={handleSendProposal}
            handleRequestedTutorProfile={handleRequestedTutorProfile}
            mode="proposals"
          />
        );
      case 'payment':
        return (
          <EscrowPhaseView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            currency={currency}
            formatAmount={formatAmount}
            refetch={refetch}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
          />
        );
      case 'submission':
        return (
          <ActiveWorkspaceView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            currency={currency}
            formatAmount={formatAmount}
            refetch={refetch}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
            handleRequestedTutorProfile={handleRequestedTutorProfile}
          />
        );
      case 'review':
        return (
          <ReviewCompletionView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            refetch={refetch}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
            latestSubmissionStatus={latestSubmissionStatus as any}
          />
        );
      default:
        return (
          <BiddingPhaseView
            assignment={assignment}
            currentUser={currentUser}
            isTutorRole={isTutorRole}
            currency={currency}
            formatAmount={formatAmount}
            refetch={refetch}
            showProposal={showProposal}
            setShowProposal={setShowProposal}
            setReportOpen={setReportOpen}
            setReportStudentOpen={setReportStudentOpen}
            handleSendProposal={handleSendProposal}
            handleRequestedTutorProfile={handleRequestedTutorProfile}
          />
        );
    }
  };

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
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm capitalize">
            <span className="w-2 h-2 rounded-full bg-gray-900"></span>
            Status: {assignment.status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400" />
            {formatDeadline(assignment.deadline, showDeadlineCountdown)}
          </span>
        </div>
      </div>

      {/* Shared Milestones Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Milestones Progress</h3>
          <span className="text-sm font-semibold text-gray-500">
            {Math.round((currentStepIndex / (workflowSteps.length - 1)) * 100)}% Complete
          </span>
        </div>
        <div ref={timelineRef} className="relative overflow-x-auto pb-4 pt-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="min-w-[768px] flex items-center justify-between overflow-visible px-2">
            {workflowSteps.map((step, index) => {
              const isComplete = isAssignmentCompleted ? true : index < currentStepIndex;
              const isActive = !isAssignmentCompleted && index === currentStepIndex;
              const isSelected = step.id === activeStep;
              const IconComponent = step.icon;

              let pillClass = "";
              if (isComplete) {
                pillClass = isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200 shadow-sm cursor-pointer"
                  : "border-emerald-500/80 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/30 cursor-pointer";
              } else if (isActive) {
                pillClass = "border-amber-400 bg-white text-gray-800 ring-2 ring-amber-100/50 cursor-pointer";
              } else {
                pillClass = "border-gray-200 bg-gray-50/30 text-gray-400 cursor-not-allowed";
              }

              return (
                <React.Fragment key={step.id}>
                  {/* Step Pill */}
                  <button
                    ref={(el) => {
                      stepRefs.current[step.id] = el;
                    }}
                    onClick={() => {
                      if (index <= currentStepIndex) {
                        if (isActive) {
                          setSelectedStep(null);
                        } else {
                          setSelectedStep(step.id);
                        }
                      }
                    }}
                    disabled={index > currentStepIndex}
                    className={`relative flex items-center gap-2 px-5 py-2.5 border rounded-full text-xs font-semibold transition-all focus:outline-none shrink-0 ${pillClass}`}
                  >
                    {isComplete ? (
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    ) : (
                      <IconComponent size={14} className={`shrink-0 ${isActive ? 'text-gray-500' : 'text-gray-300'}`} />
                    )}
                    <span>{step.label}</span>

                    {/* Active Step Info Badge */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm border border-white">
                        i
                      </span>
                    )}
                  </button>

                  {/* Connecting Line Segment */}
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`flex-1 min-w-[20px] mx-1 transition-all duration-500 ${
                        index < currentStepIndex
                          ? 'h-[4px] bg-emerald-500 rounded-full'
                          : 'h-[2px] bg-gray-200 rounded-full'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase-Specific Layout */}
      {renderPhaseView()}

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
