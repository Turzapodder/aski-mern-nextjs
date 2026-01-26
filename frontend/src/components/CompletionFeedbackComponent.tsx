import React, { useMemo, useState } from "react";
import { FileText, Link as LinkIcon, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Assignment,
  useRequestRevisionMutation,
  useSubmitFeedbackMutation,
} from "@/lib/services/assignments";

interface CompletionFeedbackComponentProps {
  assignment: Assignment;
  onCompleted?: (assignment: Assignment) => void;
}

const CompletionFeedbackComponent: React.FC<CompletionFeedbackComponentProps> = ({
  assignment,
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
  const isSubmitted = assignment.status === "submitted";
  const isCompleted = assignment.status === "completed";
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000";
  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBaseUrl}${url}`;
  };

  const handleSubmitFeedback = async () => {
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission review</h2>

      {!latestSubmission && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No submission has been received yet.
        </div>
      )}

      {latestSubmission && (
        <div className="space-y-4">
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
            <button
              type="button"
              onClick={handleRequestRevision}
              disabled={revisionLoading}
              className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
            >
              {revisionLoading ? "Requesting..." : "Request revision"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={feedbackLoading}
            className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {feedbackLoading ? "Submitting..." : "Approve & complete"}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          This assignment is completed. Thank you for your feedback.
        </div>
      )}
    </div>
  );
};

export default CompletionFeedbackComponent;
