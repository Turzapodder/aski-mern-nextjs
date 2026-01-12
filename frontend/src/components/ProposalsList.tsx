"use client";
import { useState } from "react";
import {
  Clock,
  DollarSign,
  Star,
  User,
  FileText,
  CheckCircle,
  X,
  MessageSquare,
  Calendar,
  Award
} from "lucide-react";
import {
  useGetProposalsByAssignmentQuery,
  useAcceptProposalMutation,
  useRejectProposalMutation
} from "@/lib/services/proposals";

interface ProposalsListProps {
  assignmentId: string;
  isStudent: boolean;
}

const ProposalsList = ({ assignmentId, isStudent }: ProposalsListProps) => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const {
    data: proposalsData,
    isLoading,
    error,
    refetch
  } = useGetProposalsByAssignmentQuery(assignmentId);

  const [acceptProposal] = useAcceptProposalMutation();
  const [rejectProposal] = useRejectProposalMutation();

  const proposals = proposalsData?.proposals || [];

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await acceptProposal({ id: proposalId }).unwrap();
      refetch();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h3>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Failed to load proposals</div>
          <button
            onClick={() => refetch()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Proposals ({proposals.length})
        </h3>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h4>
          <p className="text-gray-600">
            {isStudent
              ? "Tutors haven't submitted any proposals for this assignment yet."
              : "You haven't submitted any proposals for this assignment yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{proposal.tutor.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>4.8 (127 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${proposal.proposedPrice}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Proposal Details */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{proposal.title}</h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {proposal.description}
                </p>
              </div>

              {/* Cover Letter */}
              {proposal.coverLetter && (
                <div className="mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Cover Letter</h6>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {proposal.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {proposal.relevantExperience && (
                <div className="mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Relevant Experience</h6>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {proposal.relevantExperience}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {proposal.attachments && proposal.attachments.length > 0 && (
                <div className="mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Attachments</h6>
                  <div className="space-y-2">
                    {proposal.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{attachment.originalName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Delivery: {proposal.estimatedDeliveryTime} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {formatDate(proposal.createdAt)}</span>
                </div>
              </div>

              {/* Student Response */}
              {proposal.studentResponse && (
                <div className="mb-4 bg-blue-50 rounded-lg p-3">
                  <h6 className="font-medium text-blue-900 mb-2">Student Response</h6>
                  <p className="text-blue-800 text-sm">
                    {proposal.studentResponse.message}
                  </p>
                </div>
              )}

              {/* Actions for Students */}
              {isStudent && proposal.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAcceptProposal(proposal._id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Accept Proposal</span>
                  </button>
                  <button
                    onClick={() => handleRejectProposal(proposal._id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {/* Accepted Status */}
              {proposal.status === 'accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">This proposal has been accepted</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalsList;
