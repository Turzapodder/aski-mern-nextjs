import { Star, CheckCircle } from 'lucide-react';
import SubmissionDetails from './SubmissionDetails';
import FeedbackActions from './FeedbackActions';
import { useCompletionFeedback } from './hooks/useCompletionFeedback';

const CompletionFeedbackComponent = ({ assignment, onCompleted }: any) => {
  const {
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
  } = useCompletionFeedback(assignment, onCompleted);

  const isCompleted = assignment.status === 'completed';
  const existingFeedback = assignment.feedback;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {isCompleted ? 'Completed — Your Feedback' : 'Submission Review'}
      </h2>

      <SubmissionDetails submission={latestSubmission} />

      {/* Show existing feedback if assignment is already completed */}
      {isCompleted && existingFeedback?.rating && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Feedback submitted</p>
              <p className="text-xs text-gray-400">
                {existingFeedback.feedbackDate
                  ? new Date(existingFeedback.feedbackDate).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`h-5 w-5 ${
                  existingFeedback.rating >= value
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-700">
              {existingFeedback.rating}/5
            </span>
          </div>

          {existingFeedback.comments && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mt-2 leading-relaxed">
              &ldquo;{existingFeedback.comments}&rdquo;
            </p>
          )}
        </div>
      )}

      {assignment.status === 'submitted' && (
        <>
          <FeedbackActions
            rating={rating}
            setRating={setRating}
            comments={comments}
            setComments={setComments}
            onComplete={handleSubmitFeedback}
            loading={feedbackLoading}
          />

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-2">Need changes instead?</p>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Describe what needs to be revised..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all"
            />
            <button
              type="button"
              onClick={handleRequestRevision}
              disabled={revisionLoading}
              className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {revisionLoading ? 'Requesting...' : 'Request Revision'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompletionFeedbackComponent;
