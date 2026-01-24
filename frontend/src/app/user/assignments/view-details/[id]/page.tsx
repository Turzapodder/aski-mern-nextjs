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
import { useState } from "react";
import SendProposalModal from "@/components/SendProposalModal";
import ProposalsList from "@/components/ProposalsList";
import PaymentComponent from "@/components/PaymentComponent";
import CompletionFeedbackComponent from "@/components/CompletionFeedbackComponent";
import ReportModal from "@/components/ReportModal";
import { useGetAssignmentByIdQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import { Skeleton } from "@/components/ui/skeleton";

const AssignmentDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showProposal, setShowProposal] = useState(false);

  // State to track which step is active
  const [activeStep, setActiveStep] = useState<string>("details");
  const [progressWidth, setProgressWidth] = useState<string>("25%");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStudentOpen, setReportStudentOpen] = useState(false);

  // Fetch assignment data using RTK Query
  const {
    data: assignmentData,
    isLoading,
    error
  } = useGetAssignmentByIdQuery(id || '', {
    skip: !id
  });

  // Fetch current user data
  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const isTutor = currentUser?.roles?.includes('tutor');
  const reporterType = isTutor ? "tutor" : "user";
  const assignment = assignmentData?.data;
  const canTutorSubmitProposal =
    Boolean(isTutor) &&
    assignment?.status === "pending" &&
    !assignment?.assignedTutor &&
    (!assignment?.requestedTutor || assignment?.requestedTutor?._id === currentUser?._id);

  const handleSendProposal = () => {
    setShowProposal(true);
  };

  const handleRequestedTutorProfile = () => {
    if (!assignment?.requestedTutor?._id) return;
    router.push(`/user/tutors/tutor-profile/${assignment.requestedTutor._id}`);
  };

  const handlePaymentComplete = () => {
    // Move to completion step
    setActiveStep("completion");
    setProgressWidth("75%");
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log("Feedback submitted:", { rating, feedback });
    alert("Thank you for your feedback!");
    setProgressWidth("100%");
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {error && 'data' in error ?
              (error.data as any)?.message || 'Failed to load assignment details' :
              'Failed to load assignment details'
            }
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

  // No assignment found
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

  // Helper function to format deadline
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className='w-full mx-auto px-4 py-6 sm:px-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
        {/* Left Column - Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Header */}
          <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4'>
              <div className='flex-1'>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                  {assignment.title}
                </h1>
                <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600'>
                  <div className='flex items-center space-x-1'>
                    <Clock size={16} />
                    <span>{formatDeadline(assignment.deadline)}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <MapPin size={16} />
                    <span>{assignment.student?.name || 'Student'}</span>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
                {/* Submit Solution button removed */}

                <button className='w-full sm:w-auto border border-primary-300 text-primary-300 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'>
                  <Heart size={16} />
                </button>
              </div>
            </div>

            <div className='text-sm text-gray-600 mb-4 flex items-center'>
              <span className='text-primary-300 font-medium'>
                Report assignment issue
              </span>{" "}
              <button
                onClick={() => setReportOpen(true)}
                className='text-gray-400 hover:text-gray-600 p-2'
              >
                <Flag size={16} />
              </button>
            </div>

            {/* Assignment Timeline - Hidden for tutors */}
            {!isTutor && (
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <h3 className='text-sm font-medium text-gray-700 mb-4'>
                  Assignment Progress
                </h3>
                <div className='relative overflow-x-auto'>
                  <div className='min-w-[520px]'>
                    <div className='absolute top-5 left-0 right-0 h-1.5 bg-gray-200 z-0'>
                      <div
                        className='absolute top-0 left-0 h-full bg-primary-500'
                        style={{ width: progressWidth }}
                      ></div>
                    </div>

                    <div className='relative z-10 flex justify-between'>
                      {/* Step 1: Details */}
                      <div
                        className='flex flex-col items-center w-24 cursor-pointer'
                        onClick={() => {
                          setActiveStep("details");
                          setProgressWidth("25%");
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${activeStep === "details" ||
                            activeStep === "proposals" ||
                            activeStep === "payment" ||
                            activeStep === "completion"
                            ? "bg-primary-500 text-white"
                            : "bg-white border border-gray-200 text-gray-400"
                            } flex items-center justify-center mb-2 shadow-md transition-colors`}
                        >
                          <CheckCircle size={18} />
                        </div>
                        <div
                          className={`text-xs font-medium ${activeStep === "details"
                            ? "text-gray-900"
                            : "text-gray-700"
                            } text-center`}
                        >
                          Details
                        </div>
                        <div
                          className={`text-xs ${activeStep === "details" ||
                            activeStep === "proposals" ||
                            activeStep === "payment" ||
                            activeStep === "completion"
                            ? "text-primary-300 font-medium"
                            : "text-gray-400"
                            }`}
                        >
                          Completed
                        </div>
                      </div>

                      {/* Step 2: Proposals */}
                      <div
                        className='flex flex-col items-center w-24 cursor-pointer'
                        onClick={() => {
                          setActiveStep("proposals");
                          setProgressWidth("25%");
                          setShowProposal(true);
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${activeStep === "proposals"
                            ? "bg-white border-2 border-primary-500 text-primary-500"
                            : activeStep === "payment" ||
                              activeStep === "completion"
                              ? "bg-primary-500 text-white"
                              : "bg-white border border-gray-200 text-gray-400"
                            } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                        >
                          <MessageSquare size={18} />
                        </div>
                        <div
                          className={`text-xs font-medium ${activeStep === "proposals"
                            ? "text-gray-900"
                            : "text-gray-700"
                            } text-center`}
                        >
                          Proposals
                        </div>
                        <div
                          className={`text-xs ${activeStep === "proposals"
                            ? "text-primary-300 font-medium"
                            : activeStep === "payment" ||
                              activeStep === "completion"
                              ? "text-primary-300 font-medium"
                              : "text-gray-400"
                            }`}
                        >
                          {activeStep === "proposals"
                            ? "In Progress"
                            : activeStep === "payment" ||
                              activeStep === "completion"
                              ? "Completed"
                              : "Pending"}
                        </div>
                      </div>

                      {/* Step 3: Payment */}
                      <div
                        className='flex flex-col items-center w-24 cursor-pointer'
                        onClick={() => {
                          setActiveStep("payment");
                          setProgressWidth("50%");
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${activeStep === "payment"
                            ? "bg-white border-2 border-primary-500 text-primary-500"
                            : activeStep === "completion"
                              ? "bg-primary-500 text-white"
                              : "bg-white border border-gray-200 text-gray-400"
                            } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                        >
                          <CreditCard size={18} />
                        </div>
                        <div
                          className={`text-xs font-medium ${activeStep === "payment"
                            ? "text-gray-900"
                            : "text-gray-700"
                            } text-center`}
                        >
                          Payment
                        </div>
                        <div
                          className={`text-xs ${activeStep === "payment"
                            ? "text-primary-300 font-medium"
                            : activeStep === "completion"
                              ? "text-primary-300 font-medium"
                              : "text-gray-400"
                            }`}
                        >
                          {activeStep === "payment"
                            ? "In Progress"
                            : activeStep === "completion"
                              ? "Completed"
                              : "Pending"}
                        </div>
                      </div>

                      {/* Step 4: Completion & Feedback */}
                      <div
                        className='flex flex-col items-center w-24 cursor-pointer'
                        onClick={() => {
                          setActiveStep("completion");
                          setProgressWidth("75%");
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${activeStep === "completion"
                            ? "bg-white border-2 border-primary-500 text-primary-500"
                            : "bg-white border border-gray-200 text-gray-400"
                            } flex items-center justify-center mb-2 shadow-sm transition-colors`}
                        >
                          <Award size={18} />
                        </div>
                        <div
                          className={`text-xs font-medium ${activeStep === "completion"
                            ? "text-gray-900"
                            : "text-gray-700"
                            } text-center`}
                        >
                          Completion & Feedback
                        </div>
                        <div
                          className={`text-xs ${activeStep === "completion"
                            ? "text-primary-300 font-medium"
                            : "text-gray-400"
                            }`}
                        >
                          {activeStep === "completion" ? "In Progress" : "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Step Content */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Assignment Description
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                {assignment.description}
              </p>

              {/* Requirements section removed as it's not in the interface */}


            </div>
          )}

          {/* We've moved the Proposals Component to the bottom of the page */}

          {/* Payment Component */}
          {activeStep === "payment" && (
            <PaymentComponent onPaymentComplete={handlePaymentComplete} />
          )}

          {/* Completion & Feedback Component */}
          {activeStep === "completion" && (
            <CompletionFeedbackComponent
              onSubmitFeedback={handleFeedbackSubmit}
            />
          )}

          {/* Only show these sections when in details view */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm mt-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center'>
                    <Star size={20} className='text-secondary-300' />
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>
                      ${assignment.budget ?? assignment.estimatedCost}
                    </div>
                    <div className='text-sm text-gray-600'>Estimated Cost</div>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                    <Clock size={20} className='text-primary-300' />
                  </div>
                  <div>
                    <div className='text-lg font-semibold text-gray-900 capitalize'>
                      {assignment.priority} Priority
                    </div>
                    <div className='text-sm text-gray-600 capitalize'>
                      {assignment.subject}
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <div className='text-sm text-gray-600'>
                  <span className='font-medium'>Status:</span>{" "}
                  <span className='capitalize'>{assignment.status}</span>
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  <span className='font-medium'>Created:</span>{" "}
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Topics - Only show in details view */}
          {activeStep === "details" && assignment.topics && assignment.topics.length > 0 && (
            <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm mt-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Topics
              </h2>

              <div className='mb-6'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Topics Covered
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {assignment.topics.map((topic, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Engagement - Only show in details view */}
          {activeStep === "details" && (
            <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm mt-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Project Activity
              </h2>

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Views:</span>
                  <span className='flex items-center space-x-1'>
                    <div className='w-2 h-2 bg-primary-300 rounded-full'></div>
                    <span className='font-medium'>{assignment.viewCount || 0}</span>
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Proposals Submitted:</span>
                  <span className='font-medium'>{assignment.proposalCount || 0}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>In Discussion:</span>
                  <span className='font-medium'>{assignment.discussionCount || 0}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Hired:</span>
                  {assignment.assignedTutor ? (
                    <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium'>
                      Hired
                    </span>
                  ) : (
                    <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium'>
                      Not Yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proposal Modal */}
          {/* Proposal Modal */}
          {showProposal && isTutor && assignment && (
            <SendProposalModal
              isOpen={showProposal}
              onClose={() => setShowProposal(false)}
              assignment={assignment}
            />
          )}

          {/* Proposals Section - Only show in details view */}
          {activeStep === "proposals" && (
            <div className='mt-6'>
              <ProposalsList
                assignmentId={assignment._id}
                isStudent={currentUser?.roles?.includes('student') || false}
              />
            </div>
          )}

          {/* We don't need the old proposal section since we're using the ProposalsComponent */}
        </div>

        {/* Right Column - Course Info */}
        <div className='space-y-6'>
          {/* Assignment Budget */}
          <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
            <div className='text-center'>
              <div className='text-sm text-gray-600 mb-2'>
                Budget:
              </div>
              <div className='text-2xl font-bold text-gray-900 mb-1'>${assignment.budget ?? assignment.estimatedCost}</div>
              <div className='text-sm text-gray-500 mb-4 capitalize'>{assignment.priority} priority</div>
            </div>
          </div>

          {/* About the Student */}
          <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Student Information
            </h3>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-primary-300 rounded-full'></div>
                <span className='text-sm text-gray-600'>{assignment.student?.name || 'Student Name'}</span>
              </div>

              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-primary-300 rounded-full'></div>
                <span className='text-sm text-gray-600'>
                  Email: {assignment.student?.email || 'student@example.com'}
                </span>
              </div>

              <div className='pt-4 border-t border-gray-200'>
                <div className='text-sm text-gray-900 font-medium mb-1 capitalize'>
                  {assignment.subject}
                </div>
                <div className='text-sm text-gray-600 mb-3 capitalize'>
                  {assignment.status} Assignment
                </div>

                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='pt-2'>
                    <div className='font-medium text-gray-900'>Deadline:</div>
                    <div>{new Date(assignment.deadline).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              {assignment.requestedTutor && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <div className='text-sm font-medium text-gray-900 mb-2'>
                    Requested Tutor
                  </div>
                  <div className='flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-700'>
                      <UserIcon size={16} className='text-gray-400' />
                      <span>{assignment.requestedTutor.name}</span>
                    </div>
                    <button
                      onClick={handleRequestedTutorProfile}
                      className='text-xs font-semibold text-primary-400 hover:text-primary-500'
                    >
                      View profile
                    </button>
                  </div>
                  <p className='mt-2 text-xs text-gray-500'>
                    This assignment request is visible only to the selected tutor.
                  </p>
                </div>
              )}
              {isTutor && assignment.student?._id && (
                <button
                  onClick={() => setReportStudentOpen(true)}
                  className='mt-4 w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100'
                >
                  Report student profile
                </button>
              )}
            </div>
          </div>

          {/* Resources */}
          <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Resources
            </h3>

            <div className='space-y-3'>
              {/* Dynamic attachments from assignment */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <>
                  {assignment.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className='w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'
                    >
                      <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                        <FileText size={20} className='text-primary-600' />
                      </div>
                      <div className='flex-1 min-w-0 text-left'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {attachment.originalName}
                        </div>
                        <div className='text-xs text-gray-500'>Attachment</div>
                      </div>
                      <div className='text-primary-600'>
                        <Copy size={16} />
                      </div>
                    </a>
                  ))}
                </>
              )}
              {(!assignment.attachments || assignment.attachments.length === 0) && (
                <div className='text-sm text-gray-500'>No attachments available.</div>
              )}
            </div>
            {activeStep === "details" && isTutor && canTutorSubmitProposal && (
              <button
                onClick={handleSendProposal}
                className='bg-secondary-300 my-3 w-full flex justify-center hover:bg-secondary-200 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'
              >
                <Send size={16} />
                <span>Send Proposal</span>
              </button>
            )}
            {activeStep === "details" && isTutor && !canTutorSubmitProposal && (
              <div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
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
      {assignment?.student?._id && isTutor && (
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
