'use client';

import React from 'react';
import {
  FileText,
  CheckCircle,
  MessageSquare,
  CreditCard,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import PaymentComponent from '../PaymentComponent';
import { Assignment } from '@/types/assignment';

interface EscrowPhaseViewProps {
  assignment: Assignment;
  currentUser: any;
  isTutorRole: boolean;
  currency: string;
  formatAmount: (value?: number) => string;
  refetch: () => void;
  setReportOpen: (open: boolean) => void;
  setReportStudentOpen: (open: boolean) => void;
}

export const EscrowPhaseView: React.FC<EscrowPhaseViewProps> = ({
  assignment,
  currentUser,
  isTutorRole,
  currency,
  formatAmount,
  refetch,
  setReportOpen,
  setReportStudentOpen,
}) => {
  const isAssignmentStudent = assignment.student?._id === currentUser?._id;
  const isAssignmentTutor = assignment.assignedTutor?._id === currentUser?._id;

  const showPaymentSection =
    Boolean(isAssignmentStudent) &&
    Boolean(assignment.assignedTutor) &&
    assignment.paymentStatus !== 'paid' &&
    !['cancelled', 'disputed', 'resolved', 'completed'].includes(assignment.status);

  const showPaymentComplete = Boolean(isAssignmentStudent) && assignment.paymentStatus === 'paid';

  // Get matched user info to show in sidebar
  const matchedUser = isAssignmentStudent
    ? assignment.assignedTutor
    : assignment.student;
  const matchedRoleLabel = isAssignmentStudent ? 'Assigned Tutor' : 'Student Client';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Column - Payment details / Status */}
      <div className="lg:col-span-2 space-y-6">
        {/* Main Escrow Status Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Contract Security Deposit (Escrow)</h3>
              <p className="text-sm text-gray-500">Secure the budget before starting the assignment</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 font-medium">Assignment Budget</span>
              <span className="text-base font-bold text-gray-950">
                {formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Escrow Status</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                assignment.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {assignment.paymentStatus === 'paid' ? 'Secured' : 'Awaiting Deposit'}
              </span>
            </div>
          </div>

          {showPaymentSection && (
            <PaymentComponent
              assignment={assignment}
              onPaymentComplete={() => refetch()}
              currency={currency}
            />
          )}

          {showPaymentComplete && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Payment completed</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  We have secured {formatAmount(assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0)} in escrow. The tutor has been notified to begin execution.
                </p>
              </div>
            </div>
          )}

          {isTutorRole && assignment.paymentStatus !== 'paid' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Awaiting Deposit</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Please do not begin working or submitting materials. Tutors are protected under our Escrow terms; execution should only commence once the student has secured the deposit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Assignment Static description & topic summary */}
        {/* <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">Assignment Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{assignment.description}</p>
        </div> */}
      </div>

      {/* Right Column - Matched User & Details */}
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
