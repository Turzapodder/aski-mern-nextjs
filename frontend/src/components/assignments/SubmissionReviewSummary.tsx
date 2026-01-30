import React, { useMemo } from "react";
import { FileText, Link as LinkIcon, Star } from "lucide-react";
import { Assignment } from "@/lib/services/assignments";

interface SubmissionReviewSummaryProps {
  assignment: Assignment;
  submissionStatus?: "submitted" | "under_review" | "completed" | "revision_requested";
}

const SubmissionReviewSummary: React.FC<SubmissionReviewSummaryProps> = ({
  assignment,
  submissionStatus,
}) => {
  const latestSubmission = useMemo(() => {
    if (
      assignment.submissionDetails?.submissionFiles?.length ||
      assignment.submissionDetails?.submissionLinks?.length ||
      assignment.submissionDetails?.submissionNotes
    ) {
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
  const feedback = assignment.feedback;
  const ratingValue = feedback?.rating ?? 0;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000";
  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBaseUrl}${url}`;
  };

  const statusBadge = () => {
    if (submissionStatus === "under_review") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (assignment.status === "completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (assignment.status === "revision_requested") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (assignment.status === "submitted") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Submission & review</h2>
          <p className="text-sm text-gray-500">
            View the latest submission details and student feedback.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge()}`}>
          {(submissionStatus || assignment.status).replace("_", " ")}
        </span>
      </div>

      {!latestSubmission && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No submission has been received yet.
        </div>
      )}

      {latestSubmission && (
        <div className="mt-5 space-y-4">
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

      <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">Student review</p>
        {!feedback?.rating && (
          <p className="mt-2 text-sm text-gray-500">
            Awaiting student feedback.
          </p>
        )}
        {feedback?.rating && (
          <div className="mt-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={`feedback-${value}`}
                  className={`h-4 w-4 ${
                    ratingValue >= value ? "fill-current" : "text-amber-200"
                  }`}
                />
              ))}
            </div>
            {feedback.comments && (
              <p className="mt-2 text-sm text-gray-600">{feedback.comments}</p>
            )}
            {feedback.feedbackDate && (
              <p className="mt-1 text-xs text-gray-400">
                Reviewed on {new Date(feedback.feedbackDate).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionReviewSummary;
