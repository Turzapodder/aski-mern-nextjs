'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  RefreshCcw,
  XCircle,
  CheckCircle,
  Send,
  Hourglass,
} from 'lucide-react';
import {
  useRequestExtensionMutation,
  useRespondToExtensionMutation,
  useCancelOverdueAssignmentMutation,
} from '@/lib/services/assignments';
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

interface OverdueBannerProps {
  assignment: any;
  isStudent: boolean;
  isTutor: boolean;
  currentUserId: string;
  onRefetch: () => void;
}

const OverdueBanner = ({
  assignment,
  isStudent,
  isTutor,
  currentUserId,
  onRefetch,
}: OverdueBannerProps) => {
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [extensionHours, setExtensionHours] = useState(24);
  const [extensionReason, setExtensionReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [requestExtension, { isLoading: isExtending }] = useRequestExtensionMutation();
  const [respondToExtension, { isLoading: isResponding }] = useRespondToExtensionMutation();
  const [cancelOverdue, { isLoading: isCancelling }] = useCancelOverdueAssignmentMutation();

  const extensionRequest = assignment.overdueExtension;
  const hasPendingExtension = extensionRequest?.status === 'pending';
  const extensionRequestedByMe = extensionRequest?.requestedBy === currentUserId;
  const canRespondToExtension = hasPendingExtension && !extensionRequestedByMe;

  // Calculate grace period info
  const now = new Date();
  const gracePeriodEnd = assignment.gracePeriodEndsAt
    ? new Date(assignment.gracePeriodEndsAt)
    : null;
  const canCancelNow = !gracePeriodEnd || now >= gracePeriodEnd;
  const graceRemainingMs = gracePeriodEnd
    ? Math.max(0, gracePeriodEnd.getTime() - now.getTime())
    : 0;
  const graceRemainingHours = Math.ceil(graceRemainingMs / (60 * 60 * 1000));

  const handleRequestExtension = async () => {
    if (!extensionReason.trim()) {
      toast.error('Please provide a reason for the extension');
      return;
    }
    try {
      await requestExtension({
        id: assignment._id,
        extensionHours,
        reason: extensionReason,
      }).unwrap();
      toast.success('Extension request sent');
      setShowExtensionForm(false);
      setExtensionReason('');
      onRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to request extension');
    }
  };

  const handleRespondExtension = async (action: 'approve' | 'reject') => {
    try {
      await respondToExtension({ id: assignment._id, action }).unwrap();
      toast.success(action === 'approve' ? 'Extension approved' : 'Extension rejected');
      onRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to respond to extension');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOverdue(assignment._id).unwrap();
      toast.success('Assignment cancelled and refund processed');
      setIsCancelDialogOpen(false);
      onRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel assignment');
      setIsCancelDialogOpen(false);
    }
  };

  if (assignment.status !== 'overdue') return null;

  return (
    <>
      {/* Main Overdue Alert */}
      <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-red-900 mb-1">Assignment Overdue</h3>
            <p className="text-sm text-red-700 leading-relaxed">
              This assignment has passed its deadline.{' '}
              {isStudent
                ? 'You can extend the deadline or cancel for a refund.'
                : 'Please submit your work as soon as possible to avoid cancellation.'}
            </p>

            {/* Grace period info for student */}
            {isStudent && !canCancelNow && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Hourglass className="w-3.5 h-3.5 shrink-0" />
                <span>
                  The tutor has a {graceRemainingHours}h grace period to submit work.
                  You can cancel after this period ends.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pending Extension Request */}
        {hasPendingExtension && (
          <div className="mt-4 border border-blue-200 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-blue-900">Extension Request Pending</h4>
            </div>
            <p className="text-xs text-blue-700 mb-1">
              <span className="font-medium">Requested:</span>{' '}
              {extensionRequest.extensionHours}h extension
            </p>
            {extensionRequest.reason && (
              <p className="text-xs text-blue-600 mb-3">
                <span className="font-medium">Reason:</span> {extensionRequest.reason}
              </p>
            )}
            <p className="text-xs text-blue-600 mb-3">
              <span className="font-medium">New deadline:</span>{' '}
              {new Date(extensionRequest.newDeadline).toLocaleString()}
            </p>

            {canRespondToExtension && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespondExtension('approve')}
                  disabled={isResponding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isResponding ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleRespondExtension('reject')}
                  disabled={isResponding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            )}

            {extensionRequestedByMe && (
              <p className="text-xs text-blue-500 italic">
                Waiting for the other party to respond...
              </p>
            )}
          </div>
        )}

        {/* Resolved extension request info */}
        {extensionRequest?.status === 'approved' && (
          <div className="mt-4 border border-emerald-200 bg-emerald-50 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Extension was approved. The deadline has been extended.
          </div>
        )}
        {extensionRequest?.status === 'rejected' && (
          <div className="mt-4 border border-red-200 bg-red-50 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700">
            <XCircle className="w-4 h-4 shrink-0" />
            Extension request was rejected.
          </div>
        )}

        {/* Action buttons */}
        {!hasPendingExtension && (
          <div className="mt-5 flex flex-wrap gap-3">
            {/* Extension button — both tutor & student can request */}
            {(isStudent || isTutor) && !showExtensionForm && (
              <button
                onClick={() => setShowExtensionForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <RefreshCcw className="w-4 h-4 text-blue-600" />
                Request Extension
              </button>
            )}

            {/* Student cancel */}
            {isStudent && (
              <button
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={!canCancelNow}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                {canCancelNow ? 'Cancel & Refund' : `Cancel in ${graceRemainingHours}h`}
              </button>
            )}

            {/* Tutor submit late hint */}
            {isTutor && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/50 px-3 py-2 rounded-lg border border-gray-100">
                <Send className="w-3.5 h-3.5" />
                You can still submit your work below. It will be marked as &quot;Submitted Late&quot;.
              </div>
            )}
          </div>
        )}

        {/* Extension Form */}
        {showExtensionForm && (
          <div className="mt-4 border border-gray-200 bg-white rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Request Deadline Extension</h4>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Extension Duration
              </label>
              <select
                value={extensionHours}
                onChange={(e) => setExtensionHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              >
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (1 day)</option>
                <option value={48}>48 hours (2 days)</option>
                <option value={72}>72 hours (3 days)</option>
                <option value={168}>168 hours (7 days)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                placeholder="Explain why you need more time..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRequestExtension}
                disabled={isExtending || !extensionReason.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isExtending ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => {
                  setShowExtensionForm(false);
                  setExtensionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel overdue assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the assignment and refund the payment to your wallet balance.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Assignment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isCancelling}
            >
              {isCancelling ? 'Processing...' : 'Cancel & Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OverdueBanner;
