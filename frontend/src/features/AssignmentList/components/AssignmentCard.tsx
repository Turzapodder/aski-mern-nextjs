import React, { useState } from 'react';
import { Clock, Calendar, DollarSign, Eye, Send, Flag, Activity, Tag, MoreVertical, Trash2 } from 'lucide-react';
import { getPriorityColor, getStatusColor, formatDate } from '@/lib/hooks/useAssignmentsLogic';
import { useDeleteAssignmentMutation } from '@/lib/services/assignments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const AssignmentCard = ({
  assignment,
  latestStatus,
  isTutor,
  currentUser,
  formatAmount,
  handleViewDetails,
  handleSendProposal
}: any) => {
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = currentUser?._id === (typeof assignment.student === 'object' ? assignment.student?._id : assignment.student);

  const handleDelete = async () => {
    try {
      await deleteAssignment(assignment._id).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete assignment');
    }
  };

  return (
    <>
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
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => handleViewDetails(assignment._id)}
              className="flex-1 h-10 flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all font-medium space-x-2 shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Details</span>
            </button>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 w-10 shrink-0 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary-200 hover:text-primary-600 rounded-lg transition-all focus:outline-none shadow-sm">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              assignment and withdraw any pending proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssignmentCard;
