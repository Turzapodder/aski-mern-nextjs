'use client';

import React from 'react';
import {
  FileText,
  CheckCircle,
  MessageSquare,
  User as UserIcon,
  Award
} from 'lucide-react';
import CompletionFeedback from '../completionFeedback/CompletionFeedback';
import SubmissionReviewSummary from '../SubmissionReviewSummary';
import { Assignment } from '@/types/assignment';

interface ReviewCompletionViewProps {
  assignment: Assignment;
  currentUser: any;
  isTutorRole: boolean;
  refetch: () => void;
  setReportOpen: (open: boolean) => void;
  setReportStudentOpen: (open: boolean) => void;
  latestSubmissionStatus?: 'submitted' | 'under_review' | 'completed' | 'revision_requested';
}

export const ReviewCompletionView: React.FC<ReviewCompletionViewProps> = ({
  assignment,
  currentUser,
  isTutorRole,
  refetch,
  setReportOpen,
  setReportStudentOpen,
  latestSubmissionStatus,
}) => {
  const isAssignmentStudent = assignment.student?._id === currentUser?._id;
  const isAssignmentTutor = assignment.assignedTutor?._id === currentUser?._id;

  const showCompletionFeedback =
    Boolean(isAssignmentStudent) && ['submitted', 'completed'].includes(assignment.status);

  // Get matched user info to show in sidebar
  const matchedUser = isAssignmentStudent
    ? assignment.assignedTutor
    : assignment.student;
  const matchedRoleLabel = isAssignmentStudent ? 'Assigned Tutor' : 'Student Client';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Column - Submissions / Review / Feedback */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tutor: Submission sent panel */}
        {isAssignmentTutor && assignment.status === 'submitted' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Submission Sent</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Your deliverables have been successfully uploaded and are currently with the student for review. You will be notified automatically if revisions are requested.
              </p>
            </div>
          </div>
        )}

        {/* Tutor: Assignment completed panel */}
        {isAssignmentTutor && assignment.status === 'completed' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950">Assignment Completed</h3>
              <p className="text-sm text-emerald-700 mt-2 leading-relaxed">
                Congratulations! The student has reviewed and approved your submission. The payment has been released from escrow to your wallet.
              </p>
            </div>
          </div>
        )}

        {/* Submission History / Summary */}
        {isAssignmentTutor &&
          ['submitted', 'completed', 'revision_requested'].includes(assignment.status) && (
            <SubmissionReviewSummary
              assignment={assignment}
              submissionStatus={latestSubmissionStatus}
            />
          )}

        {/* Student Feedback & Decision block */}
        {showCompletionFeedback && (
          <CompletionFeedback assignment={assignment} onCompleted={() => refetch()} />
        )}
      </div>

      {/* Right Column - matched info */}
      <div className="space-y-6">
        {/* Matched User Card */}
        {matchedUser && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 relative">
              <UserIcon size={28} className="text-gray-900" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{matchedRoleLabel}</p>
            <h4 className="text-base font-bold text-gray-900">{matchedUser.name}</h4>
            <p className="text-xs text-gray-400 mb-4 truncate">{matchedUser.email}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-black hover:bg-gray-900 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
                View Profile
              </button>
              {isTutorRole ? (
                <button
                  onClick={() => setReportStudentOpen(true)}
                  className="w-10 bg-black hover:bg-gray-900 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <MessageSquare size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setReportOpen(true)}
                  className="w-10 bg-black hover:bg-gray-900 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <MessageSquare size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Required Deliverables */}
        {(assignment.requestOneToOneSession || assignment.videoExplanation) && (
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={15} className="text-black shrink-0" />
              <h4 className="text-sm font-bold text-gray-900">Required Deliverables</h4>
            </div>
            <div className="space-y-3">
              {assignment.requestOneToOneSession && (
                <div className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                  <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  </div>
                  <span>1:1 Session with Student</span>
                </div>
              )}
              {assignment.videoExplanation && (
                <div className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                  <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
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
            <FileText size={15} className="text-gray-700" />
            <h4 className="text-sm font-bold text-gray-900">Resources</h4>
          </div>
          <div className="space-y-2.5">
            {assignment.attachments && assignment.attachments.length > 0 ? (
              assignment.attachments.map((attachment: any, index: number) => (
                <a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 group">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-gray-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate group-hover:text-black transition-colors">{attachment.originalName}</span>
                </a>
              ))
            ) : (
              <p className="text-xs text-gray-400">No attachments available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
