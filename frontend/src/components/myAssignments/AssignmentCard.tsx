import React from 'react';
import { Clock, Calendar, DollarSign, Eye, Send, Flag, Activity, Tag } from 'lucide-react';
import { getPriorityColor, getStatusColor, formatDate } from '@/lib/hooks/useAssignmentsLogic';

const AssignmentCard = ({
  assignment,
  latestStatus,
  isTutor,
  currentUser,
  formatAmount,
  handleViewDetails,
  handleSendProposal
}: any) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3">
              {assignment.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Tag className="w-3.5 h-3.5" />
                Subject: {assignment.subject}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(assignment.priority)}`}>
                <Flag className="w-3.5 h-3.5" />
                Priority: {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)}`}>
                <Activity className="w-3.5 h-3.5" />
                Status: {assignment.status.replace('_', ' ').charAt(0).toUpperCase() + assignment.status.replace('_', ' ').slice(1)}
              </span>
              {latestStatus?.status === 'under_review' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700">
                  <Activity className="w-3.5 h-3.5" />
                  Under review
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 line-clamp-2 leading-relaxed">{assignment.description}</p>

          {/* {assignment.topics && assignment.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignment.topics.slice(0, 3).map((topic: string, index: number) => (
                <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  {topic}
                </span>
              ))}
              {assignment.topics.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  +{assignment.topics.length - 3} more
                </span>
              )}
            </div>
          )} */}

          <div className="flex flex-col-reverse flex-wrap items-start gap-6 text-sm text-gray-500">
            <div className='flex gap-4'><div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span><strong className="font-medium text-gray-700">Due:</strong> {formatDate(assignment.deadline)}</span>
            </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span><strong className="font-medium text-gray-700">Posted:</strong> {formatDate(assignment.createdAt)}</span>
              </div>
              {(assignment.budget ?? assignment.estimatedCost) > 0 && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900">
                    {formatAmount(assignment.budget ?? assignment.estimatedCost ?? 0)}
                  </span>
                </div>
              )}</div>
            <div className="flex items-center space-x-2 ">
              <span className="text-gray-400">By</span>
              <span className="font-medium text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{assignment.student.name}</span>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col justify-end gap-3 min-w-35">
          <button
            onClick={() => handleViewDetails(assignment._id)}
            className="flex-1 h-16 flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all font-medium space-x-2 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>

          {isTutor &&
            ['pending', 'created', 'proposal_received'].includes(assignment.status) &&
            !assignment.assignedTutor &&
            (!assignment.requestedTutor ||
              assignment.requestedTutor?._id === currentUser?._id) && (
              <button
                onClick={() => handleSendProposal(assignment)}
                className="flex-1 h-10 flex items-center justify-center px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm shadow-primary-600/20 font-medium space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Propose</span>
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
