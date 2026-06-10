'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  MessageSquare,
  CreditCard,
  User as UserIcon,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import TutorSubmissionPanel from '../TutorSubmissionPanel';
import OverdueBanner from '../OverdueBanner';
import { Assignment } from '@/types/assignment';

interface ActiveWorkspaceViewProps {
  assignment: Assignment;
  currentUser: any;
  isTutorRole: boolean;
  currency: string;
  formatAmount: (value?: number) => string;
  refetch: () => void;
  setReportOpen: (open: boolean) => void;
  setReportStudentOpen: (open: boolean) => void;
  handleRequestedTutorProfile: (assignment: Assignment) => void;
}

export const ActiveWorkspaceView: React.FC<ActiveWorkspaceViewProps> = ({
  assignment,
  currentUser,
  isTutorRole,
  currency,
  formatAmount,
  refetch,
  setReportOpen,
  setReportStudentOpen,
  handleRequestedTutorProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'details'>('workspace');

  const isAssignmentStudent = assignment.student?._id === currentUser?._id;
  const isAssignmentTutor = assignment.assignedTutor?._id === currentUser?._id;

  const canTutorSubmitWork =
    isAssignmentTutor &&
    assignment.paymentStatus === 'paid' &&
    ['assigned', 'in_progress', 'submission_pending', 'revision_requested', 'overdue'].includes(
      assignment.status
    );

  // Get matched user info to show in sidebar
  const matchedUser = isAssignmentStudent
    ? assignment.assignedTutor
    : assignment.student;
  const matchedRoleLabel = isAssignmentStudent ? 'Assigned Tutor' : 'Student Client';

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-colors focus:outline-none ${
            activeTab === 'workspace'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Briefcase size={16} />
          Workspace
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-colors focus:outline-none ${
            activeTab === 'details'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText size={16} />
          Requirements & Details
        </button>
      </div>

      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Active Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overdue Alert Banner */}
            {assignment.status === 'overdue' && (
              <OverdueBanner
                assignment={assignment}
                isStudent={isAssignmentStudent}
                isTutor={isAssignmentTutor}
                currentUserId={currentUser?._id || ''}
                onRefetch={refetch}
              />
            )}

            {/* In Progress Status Panel for Student */}
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
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Work In Progress</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Your tutor is actively working on the assignment. We have secured the payment in escrow. You will be notified automatically when the tutor submits the final solution.
                    </p>
                  </div>
                </div>
              )}

            {/* Submit work panel for Tutor */}
            {isAssignmentTutor && assignment.paymentStatus === 'paid' && canTutorSubmitWork && (
              <TutorSubmissionPanel assignment={assignment} onSubmitted={() => refetch()} />
            )}
          </div>

          {/* Right Column - sidebar info */}
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
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Budget/Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 ${(assignment.budget || assignment.estimatedCost) ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <h3 className="text-base font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{assignment.description}</p>
                {assignment.topics && assignment.topics.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {assignment.topics.map((topic: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-150 text-gray-800 rounded-full text-xs font-medium">{topic}</span>
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
          </div>

          {/* Right Column - Resources */}
          <div className="space-y-6">
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
      )}
    </div>
  );
};
