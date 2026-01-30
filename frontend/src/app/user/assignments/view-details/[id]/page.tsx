"use client";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Star,
  Flag,
  Heart,
  Copy,
  FileText,
  Send,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Award,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import SendProposalModal from "@/components/SendProposalModal";
import ProposalsList from "@/components/ProposalsList";
import PaymentComponent from "@/components/PaymentComponent";
import CompletionFeedbackComponent from "@/components/CompletionFeedbackComponent";
import TutorSubmissionPanel from "@/components/assignments/TutorSubmissionPanel";
import SubmissionReviewSummary from "@/components/assignments/SubmissionReviewSummary";
import ReportModal from "@/components/ReportModal";
import { Assignment, useGetAssignmentByIdQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { useGetSubmissionsQuery } from "@/lib/services/submissions";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const getWorkflowStep = (assignment?: Assignment) => {
  if (!assignment) return "details";
  const status = assignment.status;
  const paymentStatus = assignment.paymentStatus;

  if (["draft", "created", "pending"].includes(status)) return "details";
  if (status === "proposal_received") return "proposals";
  if (
    ["in_progress", "submission_pending", "revision_requested", "assigned"].includes(status) ||
    (paymentStatus === "paid" && status === "proposal_accepted")
  ) {
    return "submission";
  }
  if (status === "proposal_accepted" || (paymentStatus === "pending" && assignment.assignedTutor)) {
    return "payment";
  }
  if (status === "overdue") {
    if (paymentStatus === "paid" || assignment.assignedTutor) {
      return "submission";
    }
    return "details";
  }
  if (["submitted", "completed", "disputed", "resolved"].includes(status)) {
    return "review";
  }
  return "details";
};

const AssignmentDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showProposal, setShowProposal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStudentOpen, setReportStudentOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const {
    data: assignmentData,
    isLoading,
    error,
    refetch,
  } = useGetAssignmentByIdQuery(id || "", {
    skip: !id,
  });
  const { data: submissionsData } = useGetSubmissionsQuery(
    id ? { assignmentId: id, limit: 1 } : skipToken
  );

  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutorRole = currentUser?.roles?.includes("tutor");
  const currency = currentUser?.wallet?.currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, currency);
  const handleSendProposal = () => {
    setShowProposal(true);
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestedTutorProfile = () => {
    if (!assignment?.requestedTutor?._id) return;
    router.push(`/user/tutors/tutor-profile/${assignment.requestedTutor._id}`);
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
            {error && "data" in error
              ? (error.data as any)?.message || "Failed to load assignment details"
              : "Failed to load assignment details"}
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
  const reporterType = isTutorRole ? "tutor" : "user";

  const openStatuses = ["pending", "created", "proposal_received"];
  const canTutorSubmitProposal =
    Boolean(isTutorRole) &&
    openStatuses.includes(assignment.status) &&
    !assignment.assignedTutor &&
    (!assignment.requestedTutor || assignment.requestedTutor?._id === currentUser?._id);

  const canTutorSubmitWork =
    Boolean(isAssignmentTutor) &&
    assignment.paymentStatus === "paid" &&
    [
      "in_progress",
      "submission_pending",
      "revision_requested",
      "assigned",
      "proposal_accepted",
      "overdue",
    ].includes(assignment.status);

  const showPaymentSection =
    Boolean(isAssignmentStudent) &&
    Boolean(assignment.assignedTutor) &&
    assignment.paymentStatus !== "paid" &&
    !["cancelled", "disputed", "resolved", "completed"].includes(assignment.status);

  const showPaymentComplete =
    Boolean(isAssignmentStudent) && assignment.paymentStatus === "paid";

  const showCompletionFeedback =
    Boolean(isAssignmentStudent) &&
    ["submitted", "completed"].includes(assignment.status);

  const workflowSteps = [
    { id: "details", label: "Details", icon: CheckCircle },
    { id: "proposals", label: "Proposals", icon: MessageSquare },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "submission", label: "Submission", icon: Send },
    { id: "review", label: "Review", icon: Award },
  ];

  const currentStep = getWorkflowStep(assignment);
  const isAssignmentCompleted = assignment.status === "completed";
  const currentStepIndex = Math.max(
    0,
    workflowSteps.findIndex((step) => step.id === currentStep)
  );
  const progressWidth = `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%`;

  const formatDeadline = (deadline: string, showCountdown: boolean) => {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
      return "Deadline unavailable";
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
        return parts.join(" ");
      }
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      return parts.join(" ");
    };

    if (diffSeconds > 0) {
      return `Time remaining: ${formatParts(diffSeconds)}`;
    }
    if (diffSeconds === 0) {
      return "Due now";
    }
    return `Overdue by ${formatParts(Math.abs(diffSeconds))}`;
  };

  const timerActiveStatuses = [
    "proposal_accepted",
    "in_progress",
    "submission_pending",
    "revision_requested",
    "assigned",
    "submitted",
    "completed",
    "overdue",
    "disputed",
    "resolved",
  ];
  const showDeadlineCountdown = timerActiveStatuses.includes(assignment.status);

  return (
    <div className="w-full mx-auto px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {assignment.title}
                </h1>
                {assignment.status === "completed" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Assignment completed
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{formatDeadline(assignment.deadline, showDeadlineCountdown)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{assignment.student?.name || "Student"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button className="w-full sm:w-auto border border-primary-300 text-primary-300 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Heart size={16} />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4 flex items-center">
              <span className="text-primary-300 font-medium">Report assignment issue</span>{" "}
              <button
                onClick={() => setReportOpen(true)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <Flag size={16} />
              </button>
            </div>

            {!isTutorRole && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Assignment Progress
                </h3>
                <div className="relative overflow-x-auto">
                  <div className="min-w-[640px]">
                    <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-200 z-0">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary-500"
                        style={{ width: progressWidth }}
                      ></div>
                    </div>

                    <div className="relative z-10 flex justify-between">
                      {workflowSteps.map((step, index) => {
                        const isComplete = isAssignmentCompleted
                          ? true
                          : index < currentStepIndex;
                        const isCurrent = !isAssignmentCompleted && index === currentStepIndex;
                        const StepIcon = step.icon;
                        const circleClass = isComplete
                          ? "bg-primary-500 text-white"
                          : isCurrent
                          ? "bg-white border-2 border-primary-500 text-primary-500"
                          : "bg-white border border-gray-200 text-gray-400";
                        const labelClass =
                          isAssignmentCompleted || isCurrent ? "text-gray-900" : "text-gray-700";
                        const statusClass =
                          isAssignmentCompleted || isComplete || isCurrent
                            ? "text-primary-300 font-medium"
                            : "text-gray-400";
                        const statusText = isAssignmentCompleted
                          ? "Completed"
                          : isComplete
                          ? "Completed"
                          : isCurrent
                          ? "In Progress"
                          : "Pending";

                        return (
                          <div key={step.id} className="flex flex-col items-center w-24">
                            <div
                              className={`w-10 h-10 rounded-full ${circleClass} flex items-center justify-center mb-2 shadow-sm transition-colors`}
                            >
                              <StepIcon size={18} />
                            </div>
                            <div className={`text-xs font-medium ${labelClass} text-center`}>
                              {step.label}
                            </div>
                            <div className={`text-xs ${statusClass}`}>{statusText}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assignment Description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {assignment.description}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Star size={20} className="text-secondary-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}
                  </div>
                  <div className="text-sm text-gray-600">Estimated Cost</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-primary-300" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {assignment.priority} Priority
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {assignment.subject}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{assignment.status}</span>
              </div>
              {latestSubmissionStatus === "under_review" && (
                <div className="text-sm text-amber-700 mt-1">
                  <span className="font-medium">Review status:</span> Under review
                </div>
              )}
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Created:</span>{" "}
                {new Date(assignment.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Payment:</span>{" "}
                <span className="capitalize">{assignment.paymentStatus}</span>
              </div>
            </div>
          </div>

          {assignment.topics && assignment.topics.length > 0 && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics</h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {assignment.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Activity</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Views:</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                  <span className="font-medium">{assignment.viewCount || 0}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Proposals Submitted:</span>
                <span className="font-medium">{assignment.proposalCount || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Discussion:</span>
                <span className="font-medium">{assignment.discussionCount || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hired:</span>
                {assignment.assignedTutor ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Hired
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    Not Yet
                  </span>
                )}
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
                Paid amount: {formatAmount(assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0)}
              </p>
            </div>
          )}

          {isAssignmentTutor && assignment.paymentStatus !== "paid" && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Awaiting payment</h2>
              <p className="text-sm text-gray-600">
                The student must complete payment before you can submit work.
              </p>
            </div>
          )}

          {isAssignmentTutor && assignment.paymentStatus === "paid" && canTutorSubmitWork && (
            <TutorSubmissionPanel assignment={assignment} onSubmitted={() => refetch()} />
          )}

          {isAssignmentTutor && assignment.status === "submitted" && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Submission sent</h2>
              <p className="text-sm text-gray-600">
                Your submission is with the student for review. You will be notified if revisions are requested.
              </p>
            </div>
          )}

          {isAssignmentTutor &&
            ["submitted", "completed", "revision_requested"].includes(assignment.status) && (
              <SubmissionReviewSummary
                assignment={assignment}
                submissionStatus={latestSubmissionStatus}
              />
            )}

          {isAssignmentStudent &&
            assignment.assignedTutor &&
            assignment.paymentStatus === "paid" &&
            ["in_progress", "submission_pending", "revision_requested", "assigned", "overdue"].includes(
              assignment.status
            ) && (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Work in progress</h2>
                <p className="text-sm text-gray-600">
                  Your tutor is working on the assignment. We will notify you when the submission is ready.
                </p>
              </div>
            )}

          {showCompletionFeedback && (
            <CompletionFeedbackComponent
              assignment={assignment}
              submissionStatus={latestSubmissionStatus}
            />
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
              <ProposalsList
                assignmentId={assignment._id}
                isStudent={true}
                currency={currency}
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Budget:</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}
              </div>
              <div className="text-sm text-gray-500 mb-4 capitalize">
                {assignment.priority} priority
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Student Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary-300 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {assignment.student?.name || "Student Name"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary-300 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Email: {assignment.student?.email || "student@example.com"}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-900 font-medium mb-1 capitalize">
                  {assignment.subject}
                </div>
                <div className="text-sm text-gray-600 mb-3 capitalize">
                  {assignment.status} Assignment
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="pt-2">
                    <div className="font-medium text-gray-900">Deadline:</div>
                    <div>{new Date(assignment.deadline).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              {assignment.requestedTutor && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Requested Tutor
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <UserIcon size={16} className="text-gray-400" />
                      <span>{assignment.requestedTutor.name}</span>
                    </div>
                    <button
                      onClick={handleRequestedTutorProfile}
                      className="text-xs font-semibold text-primary-400 hover:text-primary-500"
                    >
                      View profile
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This assignment request is visible only to the selected tutor.
                  </p>
                </div>
              )}
              {isTutorRole && assignment.student?._id && (
                <button
                  onClick={() => setReportStudentOpen(true)}
                  className="mt-4 w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                >
                  Report student profile
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>

            <div className="space-y-3">
              {assignment.attachments && assignment.attachments.length > 0 && (
                <>
                  {assignment.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {attachment.originalName}
                        </div>
                        <div className="text-xs text-gray-500">Attachment</div>
                      </div>
                      <div className="text-primary-600">
                        <Copy size={16} />
                      </div>
                    </a>
                  ))}
                </>
              )}
              {(!assignment.attachments || assignment.attachments.length === 0) && (
                <div className="text-sm text-gray-500">No attachments available.</div>
              )}
            </div>
            {isTutorRole && canTutorSubmitProposal && (
              <button
                onClick={handleSendProposal}
                className="bg-secondary-300 my-3 w-full flex justify-center hover:bg-secondary-200 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Send Proposal</span>
              </button>
            )}
            {isTutorRole && !canTutorSubmitProposal && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                This assignment is not accepting proposals right now.
              </div>
            )}
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
    </div>
  );
};

export default AssignmentDetails;
