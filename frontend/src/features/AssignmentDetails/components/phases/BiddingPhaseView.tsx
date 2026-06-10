'use client';

import React from 'react';
import {
  FileText,
  Send,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Award,
  AlertCircle,
  User as UserIcon,
  Star
} from 'lucide-react';
import SendProposalModal from '@/components/common/SendProposalModal';
import ProposalsList from '../ProposalsList';
import { Assignment } from '@/types/assignment';

interface BiddingPhaseViewProps {
  assignment: Assignment;
  currentUser: any;
  isTutorRole: boolean;
  currency: string;
  formatAmount: (value?: number) => string;
  refetch: () => void;
  showProposal: boolean;
  setShowProposal: (show: boolean) => void;
  setReportOpen?: (open: boolean) => void;
  setReportStudentOpen: (open: boolean) => void;
  handleSendProposal: () => void;
  handleRequestedTutorProfile: (assignment: Assignment) => void;
  mode?: 'details' | 'proposals';
}

export const BiddingPhaseView: React.FC<BiddingPhaseViewProps> = ({
  assignment,
  currentUser,
  isTutorRole,
  currency,
  formatAmount,
  refetch,
  showProposal,
  setShowProposal,
  setReportOpen,
  setReportStudentOpen,
  handleSendProposal,
  handleRequestedTutorProfile,
  mode = 'details',
}) => {
  const isAssignmentStudent = assignment.student?._id === currentUser?._id;
  const openStatuses = ['pending', 'created', 'proposal_received'];
  const canTutorSubmitProposal =
    Boolean(isTutorRole) &&
    openStatuses.includes(assignment.status) &&
    !assignment.assignedTutor &&
    (!assignment.requestedTutor || assignment.requestedTutor?._id === currentUser?._id);

  // Matched User details
  const matchedUser = isAssignmentStudent
    ? assignment.assignedTutor
    : assignment.student;
  const matchedRoleLabel = isAssignmentStudent ? 'Assigned Tutor' : 'Student Client';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {mode === 'details' ? (
          <>
            {/* Description & Budget/Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 ${(assignment.budget || assignment.estimatedCost) ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <h3 className="text-base font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{assignment.description}</p>
                {assignment.topics && assignment.topics.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {assignment.topics.map((topic: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-155 text-gray-800 rounded-full text-xs font-medium">{topic}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(assignment.budget || assignment.estimatedCost) && (
                <div className="md:col-span-1 flex flex-col gap-6">
                  <div className="bg-black text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between flex-1 min-h-[160px]">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div className="mt-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80 mb-1">Estimated Budget</p>
                      <p className="text-2xl font-bold">{formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}</p>
                    </div>
                  </div>
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
          </>
        ) : (
          /* Proposals list and CTAs */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assignment Proposals</h3>
            <p className="text-sm text-gray-500 mb-6">
              {isAssignmentStudent
                ? 'Review bid proposals submitted by academic tutors for this project.'
                : 'Proposals submitted by tutors for this assignment.'}
            </p>
            <ProposalsList
              assignmentId={assignment._id}
              isStudent={isAssignmentStudent}
              currency={currency}
              currentUserId={currentUser?._id}
              assignment={assignment}
            />
          </div>
        )}
      </div>

      {/* Right Column - Secondary Actions & Metadata */}
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
                  onClick={() => setReportOpen && setReportOpen(true)}
                  className="w-10 bg-black hover:bg-gray-900 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <MessageSquare size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Deliverables */}
        {(assignment.requestOneToOneSession || assignment.videoExplanation) && (
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200/80">
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

        {/* Resources / Attachments */}
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

          {assignment.requestedTutor && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Requested Tutor</p>
              <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserIcon size={14} className="text-gray-400" />
                  <span className="text-xs font-medium">{assignment.requestedTutor.name}</span>
                </div>
                <button onClick={() => handleRequestedTutorProfile(assignment)} className="text-[10px] font-bold text-black hover:underline">View</button>
              </div>
            </div>
          )}

          {mode === 'proposals' && (
            <>
              {isTutorRole && canTutorSubmitProposal && (
                <button onClick={handleSendProposal} className="mt-4 w-full bg-black hover:bg-gray-900 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-sm">
                  <Send size={14} />
                  <span>Send Proposal</span>
                </button>
              )}
              {isTutorRole && !canTutorSubmitProposal && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 font-medium">
                  This assignment is not accepting proposals right now.
                </div>
              )}
            </>
          )}

          {isTutorRole && assignment.student?._id && (
            <button onClick={() => setReportStudentOpen(true)} className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
              Report student profile
            </button>
          )}
        </div>

        {/* Secure Best Pricing Card */}
        <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center mb-4">
            <Award size={18} />
          </div>
          <h4 className="text-sm font-bold mb-2">Secure Best Pricing</h4>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Early assignment posting allows more tutors to bid, giving you a wider range of academic experts at competitive rates.
          </p>
        </div>
      </div>

      {showProposal && isTutorRole && assignment && (
        <SendProposalModal
          isOpen={showProposal}
          onClose={() => setShowProposal(false)}
          assignment={assignment}
          currency={currency}
        />
      )}
    </div>
  );
};
