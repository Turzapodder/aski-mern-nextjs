import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Link as LinkIcon, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Assignment,
  useRequestRevisionMutation,
  useSubmitFeedbackMutation,
} from "@/lib/services/assignments";
import { useMarkSubmissionUnderReviewMutation } from "@/lib/services/submissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompletionFeedbackComponentProps {
  assignment: Assignment;
  submissionStatus?: "submitted" | "under_review" | "completed" | "revision_requested";
  onCompleted?: (assignment: Assignment) => void;
}

const CompletionFeedbackComponent: React.FC<CompletionFeedbackComponentProps> = ({
  assignment,
  submissionStatus,
  onCompleted,
}) => {
  const [rating, setRating] = useState<number | undefined>(
    assignment.feedback?.rating
  );
  const [comments, setComments] = useState(assignment.feedback?.comments || "");
  const [revisionNote, setRevisionNote] = useState("");
  const [submitFeedback, { isLoading: feedbackLoading }] =
    useSubmitFeedbackMutation();
  const [requestRevision, { isLoading: revisionLoading }] =
    useRequestRevisionMutation();
  const [markUnderReview] = useMarkSubmissionUnderReviewMutation();
  const hasMarkedRef = useRef(false);

  const latestSubmission = useMemo(() => {
    if (assignment.submissionDetails?.submissionFiles?.length ||
        assignment.submissionDetails?.submissionLinks?.length ||
        assignment.submissionDetails?.submissionNotes) {
      return assignment.submissionDetails;
    }
    if (assignment.submissionHistory && assignment.submissionHistory.length > 0) {
      return assignment.submissionHistory[assignment.submissionHistory.length - 1];
    }
    return undefined;
  }, [assignment.submissionDetails, assignment.submissionHistory]);

  const submissionFiles = latestSubmission?.submissionFiles ?? [];
  const submissionLinks = latestSubmission?.submissionLinks ?? [];
  const submissionNotes = latestSubmission?.submissionNotes;
  const submissionTitle = latestSubmission?.title;
  const submissionDescription = latestSubmission?.description;
  const isSubmitted = assignment.status === "submitted";
  const isCompleted = assignment.status === "completed";
  const completedRating = assignment.feedback?.rating ?? 0;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000";
  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBaseUrl}${url}`;
  };

  useEffect(() => {
    if (!isSubmitted || hasMarkedRef.current) return;
    hasMarkedRef.current = true;
    markUnderReview({ assignmentId: assignment._id }).catch(() => null);
  }, [assignment._id, isSubmitted, markUnderReview]);

  const handleSubmitFeedback = async () => {
    if (!rating) {
      toast.error("Please select a star rating to complete the assignment.");
      return;
    }
    try {
      const result = await submitFeedback({
        id: assignment._id,
        rating,
        comments: comments.trim() || undefined,
      }).unwrap();
      toast.success("Feedback submitted. Assignment marked as complete.");
      if (result?.data && onCompleted) {
        onCompleted(result.data);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to submit feedback");
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      toast.error("Please add a revision note.");
      return;
    }
    try {
      await requestRevision({
        id: assignment._id,
        note: revisionNote.trim(),
      }).unwrap();
      toast.success("Revision requested.");
      setRevisionNote("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to request revision");
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Submission review</h2>
        {submissionStatus === "under_review" && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Under review
          </span>
        )}
      </div>

      {!latestSubmission && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No submission has been received yet.
        </div>
      )}

      {latestSubmission && (
        <div className="space-y-4">
          {(submissionTitle || submissionDescription) && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              {submissionTitle && (
                <p className="text-sm font-semibold text-gray-900">{submissionTitle}</p>
              )}
              {submissionDescription && (
                <p className="mt-1 text-sm text-gray-600">{submissionDescription}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Files</p>
            {submissionFiles.length === 0 && (
              <p className="text-sm text-gray-500">No files submitted.</p>
            )}
            {submissionFiles.length > 0 && (
              <div className="space-y-2">
                {submissionFiles.map((file) => (
                  <a
                    key={file.url}
                    href={resolveFileUrl(file.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {file.originalName || file.filename}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Links</p>
            {submissionLinks.length === 0 && (
              <p className="text-sm text-gray-500">No links submitted.</p>
            )}
            {submissionLinks.length > 0 && (
              <div className="space-y-2">
                {submissionLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            )}
          </div>

          {submissionNotes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tutor notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{submissionNotes}</p>
            </div>
          )}
        </div>
      )}

      {assignment.submissionHistory && assignment.submissionHistory.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Submission history</p>
          <div className="space-y-2">
            {assignment.submissionHistory.map((entry, index) => (
              <div
                key={`${entry.submittedAt || "submission"}-${index}`}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"
              >
                <div className="flex items-center justify-between">
                  <span>Revision {entry.revisionIndex ?? index + 1}</span>
                  <span>
                    {entry.submittedAt
                      ? new Date(entry.submittedAt).toLocaleString()
                      : "Unknown date"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  {(entry.submissionFiles?.length || 0)} files,{" "}
                  {(entry.submissionLinks?.length || 0)} links
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-full p-1 ${
                    (rating ?? 0) >= value ? "text-amber-500" : "text-gray-300"
                  }`}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
            {!rating && (
              <p className="mt-2 text-xs text-amber-600">
                Star rating is required to accept and complete this assignment.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (optional)
            </label>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request revision
              </label>
              <input
                value={revisionNote}
                onChange={(event) => setRevisionNote(event.target.value)}
                placeholder="Add a short revision note"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={revisionLoading}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                >
                  {revisionLoading ? "Requesting..." : "Request revision"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request revisions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Let your tutor know what needs to be updated. This will reopen the submission step.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRequestRevision}>
                    Confirm request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={feedbackLoading || !rating}
                className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
              >
                {feedbackLoading ? "Submitting..." : "Approve & complete"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete this assignment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will release payment to the tutor and mark the assignment as completed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmitFeedback}>
                  Confirm completion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isCompleted && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="font-semibold">Assignment completed</div>
          {assignment.feedback?.rating && (
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={`completed-${value}`}
                  className={`h-4 w-4 ${
                    completedRating >= value ? "fill-current" : "text-amber-200"
                  }`}
                />
              ))}
            </div>
          )}
          {assignment.feedback?.feedbackDate && (
            <div className="mt-1 text-xs text-emerald-700/80">
              Completed on {new Date(assignment.feedback.feedbackDate).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompletionFeedbackComponent;
