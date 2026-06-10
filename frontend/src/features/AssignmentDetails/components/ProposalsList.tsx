'use client';

import { useMemo, useState } from 'react';
import {
  Clock,
  DollarSign,
  Star,
  User,
  FileText,
  CheckCircle,
  X,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/hooks/useSocket';
import {
  useGetProposalsByAssignmentQuery,
  useAcceptProposalMutation,
  useRejectProposalMutation,
} from '@/lib/services/proposals';
import { useCreateChatMutation } from '@/lib/services/chat';
import { assignmentsApi } from '@/lib/services/assignments';
import { useDispatch } from 'react-redux';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SendProposalModal from '@/components/common/SendProposalModal';

interface ProposalsListProps {
  assignmentId: string;
  isStudent: boolean;
  currency?: string;
  currentUserId?: string;
  assignment?: any;
}

const ProposalsList = ({
  assignmentId,
  isStudent,
  currency,
  currentUserId,
  assignment,
}: ProposalsListProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const activeCurrency = currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, activeCurrency);

  const [selectedProposalForReview, setSelectedProposalForReview] = useState<any | null>(null);
  const [editingProposal, setEditingProposal] = useState<any | null>(null);

  const {
    data: proposalsData,
    isLoading,
    error,
    refetch,
  } = useGetProposalsByAssignmentQuery(assignmentId, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [acceptProposal] = useAcceptProposalMutation();
  const [rejectProposal] = useRejectProposalMutation();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  // Filter proposals so a tutor only sees their own proposal
  const proposals = useMemo(() => {
    const list = proposalsData?.data?.proposals || [];
    if (!isStudent && currentUserId) {
      return list.filter((p: any) => (p.tutor?._id || p.tutor) === currentUserId);
    }
    return list;
  }, [proposalsData, isStudent, currentUserId]);

  useSocket({
    onNotification: (payload) => {
      const incoming = payload?.notification || payload;
      const incomingAssignmentId = incoming?.data?.assignmentId || incoming?.assignmentId;
      if (incomingAssignmentId === assignmentId) {
        refetch();
      }
    },
    onChatUpdated: (payload) => {
      if (payload?.assignmentId === assignmentId) {
        refetch();
      }
    },
  });

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await acceptProposal({ id: proposalId }).unwrap();
      refetch();
      dispatch(assignmentsApi.util.invalidateTags([{ type: 'Assignment', id: assignmentId }]));
    } catch (error) {
      console.error('Failed to accept proposal:', error);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await rejectProposal({ id: proposalId }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to reject proposal:', error);
    }
  };

  const handleMessageTutor = async (tutorId: string, existingConversation?: string | any) => {
    const conversationId = typeof existingConversation === 'string' ? existingConversation : existingConversation?._id;
    if (conversationId) {
      router.push(`/user/messages?chatId=${conversationId}`);
      return;
    }

    try {
      const response: any = await createChat({
        type: 'direct',
        tutorId: tutorId,
        participants: [tutorId],
      }).unwrap();

      if (response.status === 'success' || response.chat?._id) {
        router.push(`/user/messages?chatId=${response.chat?._id || response.data?.chat?._id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Proposals</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Proposals</h3>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Failed to load proposals</div>
          <button
            onClick={() => refetch()}
            className="text-black hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {isStudent ? `Proposals (${proposals.length})` : 'Your Submitted Proposal'}
        </h3>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-base font-semibold text-gray-900 mb-1">No proposal submitted</h4>
          <p className="text-sm text-gray-500 max-w-sm mx-auto px-4">
            {isStudent
              ? "Tutors haven't submitted any proposals for this assignment yet."
              : "You haven't submitted a proposal for this assignment yet. Send a proposal from the action panel to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const tutor = proposal.tutor as any;
            return (
              <div
                key={proposal._id}
                className="flex flex-col lg:flex-row items-stretch sm:items-center justify-between p-4 sm:p-5 border border-gray-100 rounded-2xl hover:shadow-sm transition-all bg-white gap-4"
              >
                {/* Left Info: Avatar + Name + Subtitle + Delivery */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                    {tutor.profileImage ? (
                      <img
                        src={tutor.profileImage}
                        alt={tutor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-505" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{tutor.name}</h4>
                    
                    {/* Tutor bio snippet */}
                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                      {tutor.tutorProfile?.bio || tutor.about || proposal.title || 'Expert Tutor ready to assist'}
                    </p>

                    <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-gray-900 font-semibold">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                      <span className='w-max'>Expected Delivery: {proposal.estimatedDeliveryTime} hours</span>
                    </div>
                  </div>
                </div>

                {/* Right Info: Mail + Budget + Review button */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-none">
                  <div className="flex items-center gap-2">
                    {/* Mail button (Only relevant for student reviewing or if conversation exists) */}
                    {(isStudent || proposal.conversation) && (
                      <button
                        onClick={() => handleMessageTutor(tutor._id, proposal.conversation)}
                        disabled={isCreatingChat}
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-105 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
                        title="Message Tutor"
                      >
                        <Mail className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </button>
                    )}

                    {/* Proposed Budget */}
                    <div className="text-base sm:text-lg font-bold text-gray-900 px-1 sm:px-2">
                      {formatAmount(proposal.proposedPrice)}
                    </div>
                  </div>

                  {/* Review/Action button */}
                  {isStudent ? (
                    <Button
                      onClick={() => setSelectedProposalForReview(proposal)}
                      className="bg-black hover:bg-gray-900 text-white font-bold rounded-xl px-4 py-2 sm:px-5 h-9 sm:h-10 shadow-sm text-[11px] sm:text-xs shrink-0"
                    >
                      Review
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingProposal(proposal)}
                      className="bg-black hover:bg-gray-900 text-white font-bold rounded-xl px-4 py-2 sm:px-5 h-9 sm:h-10 shadow-sm text-[11px] sm:text-xs shrink-0"
                    >
                      Edit Proposal
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      {selectedProposalForReview && (
        <Dialog open={!!selectedProposalForReview} onOpenChange={(open) => !open && setSelectedProposalForReview(null)}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white mx-4 max-h-[90vh]">
            {/* Header: Neutral Dark Banner */}
            <div className="bg-black p-5 sm:p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5" />
                  Review Proposal
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-xs sm:text-sm mt-1">
                  Evaluate terms and tutor profiles before accepting the contract
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto max-h-[60vh]">
              
              {/* Section 1: Tutor Profile Information */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tutor Information</h4>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                    {selectedProposalForReview.tutor.profileImage ? (
                      <img
                        src={selectedProposalForReview.tutor.profileImage}
                        alt={selectedProposalForReview.tutor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-sm sm:text-base">{selectedProposalForReview.tutor.name}</h5>
                    
                    {/* Tutor rating */}
                    {typeof selectedProposalForReview.tutor.publicStats?.averageRating === 'number' ? (
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span className="font-bold text-gray-800">
                          {selectedProposalForReview.tutor.publicStats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-400">
                          ({selectedProposalForReview.tutor.publicStats.totalReviews || 0} reviews)
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[10px] bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded-md mt-1">New Tutor</span>
                    )}

                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {selectedProposalForReview.tutor.bio || 'Professional tutor focused on delivering high-quality assistance and explaining core concepts clearly.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Proposal Title & Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Proposed Offer</h4>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">{selectedProposalForReview.title}</h3>
                </div>

                {/* Offer Stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">Proposed Price</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{formatAmount(selectedProposalForReview.proposedPrice)}</span>
                    </div>
                  </div>

                  <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">Estimated Delivery</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{selectedProposalForReview.estimatedDeliveryTime} hours</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedProposalForReview.description && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Proposal Description</span>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed text-justify bg-gray-50/30 p-3.5 border border-gray-100 rounded-xl">
                      {selectedProposalForReview.description}
                    </p>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedProposalForReview.coverLetter && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cover Letter</span>
                    <div className="bg-gray-50/30 p-3.5 border border-gray-100 rounded-xl">
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{selectedProposalForReview.coverLetter}</p>
                    </div>
                  </div>
                )}

                {/* Relevant Experience */}
                {selectedProposalForReview.relevantExperience && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Relevant Experience</span>
                    <div className="bg-gray-50/30 p-3.5 border border-gray-100 rounded-xl">
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{selectedProposalForReview.relevantExperience}</p>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedProposalForReview.attachments && selectedProposalForReview.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attachments</span>
                    <div className="space-y-2">
                      {selectedProposalForReview.attachments.map((attachment: any, index: number) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-xs sm:text-sm text-black hover:underline"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>{attachment.originalName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status display / Action footer inside dialog */}
              <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end">
                {isStudent && selectedProposalForReview.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRejectProposal(selectedProposalForReview._id);
                        setSelectedProposalForReview(null);
                      }}
                      className="w-28 sm:w-32 rounded-xl h-10 sm:h-11 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-all text-xs"
                    >
                      Reject Offer
                    </Button>
                    <Button
                      onClick={() => {
                        handleAcceptProposal(selectedProposalForReview._id);
                        setSelectedProposalForReview(null);
                      }}
                      className="w-40 sm:w-48 rounded-xl h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-md shadow-green-100 text-xs"
                    >
                      Accept Proposal
                    </Button>
                  </>
                )}

                {/* Accepted Status Banner */}
                {selectedProposalForReview.status === 'accepted' && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-center gap-2 text-green-800 font-semibold text-xs sm:text-sm">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>This proposal has already been accepted</span>
                  </div>
                )}

                {/* Rejected Status Banner */}
                {selectedProposalForReview.status === 'rejected' && (
                  <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-center gap-2 text-rose-800 font-semibold text-xs sm:text-sm">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>This proposal was rejected</span>
                  </div>
                )}

                {/* Withdrawn/Other Status Banner */}
                {['withdrawn', 'cancelled'].includes(selectedProposalForReview.status) && (
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-gray-800 font-semibold text-xs sm:text-sm">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>This proposal is no longer active ({selectedProposalForReview.status})</span>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && assignment && (
        <SendProposalModal
          isOpen={!!editingProposal}
          onClose={() => {
            setEditingProposal(null);
            refetch();
          }}
          assignment={assignment}
          proposalToEdit={editingProposal}
          currency={currency}
        />
      )}
    </div>
  );
};

export default ProposalsList;
