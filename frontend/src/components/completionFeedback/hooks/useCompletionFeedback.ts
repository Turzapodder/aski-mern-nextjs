import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  useRequestRevisionMutation,
  useSubmitFeedbackMutation,
} from '@/lib/services/assignments';
import { useMarkSubmissionUnderReviewMutation } from '@/lib/services/submissions';

export function useCompletionFeedback(assignment: any, onCompleted?: any) {
  const [rating, setRating] = useState<number | undefined>(assignment.feedback?.rating);
  const [comments, setComments] = useState(assignment.feedback?.comments || '');
  const [revisionNote, setRevisionNote] = useState('');

  const [submitFeedback, { isLoading: feedbackLoading }] = useSubmitFeedbackMutation();
  const [requestRevision, { isLoading: revisionLoading }] = useRequestRevisionMutation();
  const [markUnderReview] = useMarkSubmissionUnderReviewMutation();

  const hasMarkedRef = useRef(false);

  const latestSubmission = useMemo(() => {
    if (
      assignment.submissionDetails?.submissionFiles?.length ||
      assignment.submissionDetails?.submissionLinks?.length ||
      assignment.submissionDetails?.submissionNotes
    ) {
      return assignment.submissionDetails;
    }

    if (assignment.submissionHistory?.length) {
      return assignment.submissionHistory[assignment.submissionHistory.length - 1];
    }

    return undefined;
  }, [assignment]);

  const isSubmitted = assignment.status === 'submitted';

  useEffect(() => {
    if (!isSubmitted || hasMarkedRef.current) return;

    hasMarkedRef.current = true;
    markUnderReview({ assignmentId: assignment._id }).catch(() => null);
  }, [assignment._id, isSubmitted, markUnderReview]);

  const handleSubmitFeedback = async () => {
    if (!rating) {
      toast.error('Please select a star rating to complete the assignment.');
      return;
    }

    const result = await submitFeedback({
      id: assignment._id,
      rating,
      comments: comments.trim() || undefined,
    }).unwrap();

    if (result?.data && onCompleted) {
      onCompleted(result.data);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      toast.error('Please add a revision note.');
      return;
    }

    await requestRevision({
      id: assignment._id,
      note: revisionNote.trim(),
    }).unwrap();

    setRevisionNote('');
  };

  return {
    rating,
    setRating,
    comments,
    setComments,
    revisionNote,
    setRevisionNote,
    latestSubmission,
    feedbackLoading,
    revisionLoading,
    handleSubmitFeedback,
    handleRequestRevision,
  };
}